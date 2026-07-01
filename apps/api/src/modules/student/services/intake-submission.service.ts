import { Injectable } from '@nestjs/common';
import type { StudentIntakeSubmission, SubmitStudentIntakeDto, ApproveIntakeDto } from '../types/student-portal.types';

@Injectable()
export class IntakeSubmissionService {
  private submissions: Map<string, StudentIntakeSubmission> = new Map();
  private studentApprovalStatus: Map<string, 'pending' | 'approved' | 'rejected'> = new Map();

  submitIntake(studentId: string, data: SubmitStudentIntakeDto): StudentIntakeSubmission {
    const submission: StudentIntakeSubmission = {
      id: `submission-${Date.now()}`,
      studentId,
      status: 'pending',
      entranceExamScore: data.entranceExamScore,
      entranceExamPassed: data.entranceExamPassed,
      studentAnswers: data.studentAnswers,
      enrollmentData: data.enrollmentData,
      submittedAt: new Date().toISOString(),
    };

    this.submissions.set(submission.id, submission);
    this.studentApprovalStatus.set(studentId, 'pending');

    return submission;
  }

  getStudentApprovalStatus(studentId: string): 'pending' | 'approved' | 'rejected' | null {
    return this.studentApprovalStatus.get(studentId) || null;
  }

  getSubmission(submissionId: string): StudentIntakeSubmission | undefined {
    return this.submissions.get(submissionId);
  }

  getStudentSubmission(studentId: string): StudentIntakeSubmission | undefined {
    for (const submission of this.submissions.values()) {
      if (submission.studentId === studentId) {
        return submission;
      }
    }
    return undefined;
  }

  getPendingSubmissions(): StudentIntakeSubmission[] {
    return Array.from(this.submissions.values()).filter((s) => s.status === 'pending');
  }

  approveIntake(submissionId: string, adminId: string): StudentIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.status = 'approved';
    submission.approvedAt = new Date().toISOString();
    submission.reviewedBy = adminId;

    this.studentApprovalStatus.set(submission.studentId, 'approved');
    this.submissions.set(submissionId, submission);

    return submission;
  }

  rejectIntake(submissionId: string, adminId: string, reason: string): StudentIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.status = 'rejected';
    submission.rejectionReason = reason;
    submission.reviewedBy = adminId;

    this.studentApprovalStatus.set(submission.studentId, 'rejected');
    this.submissions.set(submissionId, submission);

    return submission;
  }
}
