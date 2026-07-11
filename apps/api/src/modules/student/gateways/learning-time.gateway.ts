import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { SupabaseAuthService } from '../../auth/services/supabase-auth.service';
import { StudentPortalService } from '../services/student-portal.service';

interface TrackedSession {
  studentId: string;
  /** Whether the server clock is currently accruing time for this socket. */
  running: boolean;
  /** Server timestamp (ms) up to which time has already been credited. */
  lastTickAt: number;
}

/**
 * Longest stretch a single flush may credit. Heartbeats arrive every ~5s, so a
 * larger gap means the client froze, slept, or lost connectivity — that time
 * was not spent learning and is discarded.
 */
const MAX_CREDIT_MS = 30_000;

/**
 * Second-accurate learning time over a socket. The server clock is the source
 * of truth: elapsed time is measured between heartbeats on the server, credited
 * via StudentPortalService.recordLearningSeconds, and persisted on every flush —
 * so closing the browser mid-session loses at most a few seconds, and
 * reconnecting resumes from the exact persisted total.
 */
@WebSocketGateway({
  namespace: 'learning-time',
  cors: { origin: true, credentials: true },
})
export class LearningTimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LearningTimeGateway.name);
  private readonly sessions = new Map<string, TrackedSession>();

  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly studentPortalService: StudentPortalService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        typeof client.handshake.auth?.token === 'string' ? client.handshake.auth.token.trim() : '';

      if (!token) {
        throw new Error('Missing access token.');
      }

      const { localUser } = await this.supabaseAuthService.getOrCreateLocalUserFromAccessToken(token);

      if (localUser.role !== 'student' || localUser.status !== 'active') {
        throw new Error('Only active students can track learning time.');
      }

      this.sessions.set(client.id, {
        studentId: localUser.id,
        running: false,
        lastTickAt: Date.now(),
      });

      // Send the exact persisted totals immediately so a returning student
      // sees their time restored to the second.
      client.emit('learning:state', this.studentPortalService.getLearningTimeState(localUser.id));
    } catch (error) {
      this.logger.warn(
        `Rejected learning-time connection: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      client.emit('learning:error', { message: 'Unauthorized learning-time connection.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.flush(client);
    this.sessions.delete(client.id);
  }

  @SubscribeMessage('learning:start')
  handleStart(@ConnectedSocket() client: Socket, @MessageBody() body?: { lessonId?: string }) {
    const session = this.sessions.get(client.id);

    if (!session) {
      return;
    }

    try {
      this.studentPortalService.setLearningSession(session.studentId, { active: true });

      if (body?.lessonId) {
        this.studentPortalService.recordLessonSessionStart(session.studentId, body.lessonId);
      }
    } catch (error) {
      client.emit('learning:error', {
        message: error instanceof Error ? error.message : 'Unable to start the learning session.',
      });
      return;
    }

    session.running = true;
    session.lastTickAt = Date.now();
    client.emit('learning:state', this.studentPortalService.getLearningTimeState(session.studentId));
  }

  @SubscribeMessage('learning:heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    this.flush(client);
  }

  @SubscribeMessage('learning:pause')
  handlePause(@ConnectedSocket() client: Socket) {
    this.flush(client);
    const session = this.sessions.get(client.id);

    if (session) {
      session.running = false;
      client.emit('learning:state', this.studentPortalService.getLearningTimeState(session.studentId));
    }
  }

  @SubscribeMessage('learning:resume')
  handleResume(@ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);

    if (session) {
      session.running = true;
      session.lastTickAt = Date.now();
    }
  }

  /** Credit whole elapsed seconds since the last tick, keeping the sub-second remainder. */
  private flush(client: Socket) {
    const session = this.sessions.get(client.id);

    if (!session || !session.running) {
      return;
    }

    const now = Date.now();
    const elapsedMs = now - session.lastTickAt;

    if (elapsedMs > MAX_CREDIT_MS) {
      // The gap is too large to be real learning time — drop it entirely.
      session.lastTickAt = now;
      return;
    }

    const wholeSeconds = Math.floor(elapsedMs / 1000);

    if (wholeSeconds < 1) {
      return;
    }

    session.lastTickAt += wholeSeconds * 1000;

    try {
      const state = this.studentPortalService.recordLearningSeconds(session.studentId, wholeSeconds);
      client.emit('learning:state', state);

      if (state.examUnlocked || !state.learningSessionActive) {
        session.running = false;
      }
    } catch (error) {
      // The session was paused, completed, or locked server-side — stop the
      // clock until the client explicitly starts again.
      session.running = false;
      client.emit('learning:error', {
        message: error instanceof Error ? error.message : 'Learning time could not be recorded.',
      });
    }
  }
}
