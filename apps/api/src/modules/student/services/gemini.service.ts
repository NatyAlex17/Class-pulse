import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeminiChatMessage {
  role: 'user' | 'model';
  text: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const TUTOR_PERSONA = `You are Grace, a veteran nursing instructor guiding a Certified Nursing Assistant (CNA) student through their coursework.
Tone: encouraging, professional, safety-obsessed, warm.
Always prioritize patient safety and resident rights above all else. If a topic touches on a "never event" (abuse, neglect, a safety violation), be firm and clear about why it matters.
Remind students that CNAs observe and report; they do not diagnose.
The lesson context below is background for the current lesson the student is viewing — use it when it's relevant, but you are not limited to it. Answer any question the student asks, including general nursing/CNA topics, exam prep, study skills, or other coursework questions, even if unrelated to the current lesson.
Keep answers concise and easy to read for a student studying on a tight schedule.`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly configService: ConfigService) {}

  async getTutorReply(history: GeminiChatMessage[], question: string, lessonContext: string): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const contents = [
      ...history.map((message) => ({ role: message.role, parts: [{ text: message.text }] })),
      { role: 'user', parts: [{ text: question }] },
    ];

    const systemInstruction = `${TUTOR_PERSONA}\n\nLesson context:\n###\n${lessonContext || 'No additional context provided.'}\n###`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`Gemini API error (${response.status}): ${errorBody}`);
      throw new Error(`Gemini API request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

    return text.trim() || "I'm sorry, I couldn't come up with a response. Please try rephrasing your question.";
  }
}
