import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  IntakeDocumentReviewStatus,
  IntakeQuestionReviewStatus,
  StudentIntakeSubmission,
  SubmitStudentIntakeDto,
} from '../types/student-portal.types';

@Injectable()
export class IntakeSubmissionService {
  private readonly storagePath = join(process.cwd(), '.data', 'intake-submissions.json');
  private submissions: Map<string, StudentIntakeSubmission> = new Map();
  private studentApprovalStatus: Map<string, 'pending' | 'approved' | 'rejected'> = new Map();

  constructor() {
    this.loadState();
  }

  submitIntake(studentId: string, data: SubmitStudentIntakeDto): StudentIntakeSubmission {
    const existing = this.getStudentSubmission(studentId);
    const submission: StudentIntakeSubmission = {
      id: existing?.id ?? `submission-${Date.now()}`,
      studentId,
      status: 'pending',
      entranceExamScore: data.entranceExamScore,
      entranceExamPassed: data.entranceExamPassed,
      passingScore: data.passingScore,
      questions: data.questions,
      documents: data.documents,
      enrollmentData: data.enrollmentData,
      submittedAt: new Date().toISOString(),
      approvedAt: undefined,
      rejectionReason: undefined,
      reviewedBy: undefined,
    };

    this.submissions.set(submission.id, submission);
    this.studentApprovalStatus.set(studentId, 'pending');
    this.persistState();

    return submission;
  }

  getStudentApprovalStatus(studentId: string): 'pending' | 'approved' | 'rejected' | null {
    return this.studentApprovalStatus.get(studentId) || null;
  }

  getStudentApprovalSummary(studentId: string) {
    const submission = this.getStudentSubmission(studentId);

    return {
      status: this.getStudentApprovalStatus(studentId),
      submissionId: submission?.id,
      rejectionReason: submission?.rejectionReason,
      approvedAt: submission?.approvedAt,
      reviewedBy: submission?.reviewedBy,
    };
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

  getAllSubmissions(): StudentIntakeSubmission[] {
    return Array.from(this.submissions.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  approveIntake(
    submissionId: string,
    adminId: string,
    questionReviews?: Record<string, 'correct' | 'wrong'>,
    documentReviews?: Record<string, 'approved' | 'rejected'>,
  ): StudentIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new BadRequestException('Submission not found.');
    }

    this.applyQuestionReview(submission, questionReviews, true);
    this.applyDocumentReview(submission, documentReviews, true);
    submission.status = 'approved';
    submission.approvedAt = new Date().toISOString();
    submission.reviewedBy = adminId;
    submission.rejectionReason = undefined;

    this.studentApprovalStatus.set(submission.studentId, 'approved');
    this.submissions.set(submissionId, submission);
    this.persistState();

    return submission;
  }

  rejectIntake(
    submissionId: string,
    adminId: string,
    reason: string,
    questionReviews?: Record<string, 'correct' | 'wrong'>,
    documentReviews?: Record<string, 'approved' | 'rejected'>,
  ): StudentIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new BadRequestException('Submission not found.');
    }

    this.applyQuestionReview(submission, questionReviews, false);
    this.applyDocumentReview(submission, documentReviews, false);
    submission.status = 'rejected';
    submission.rejectionReason = reason;
    submission.reviewedBy = adminId;
    submission.approvedAt = undefined;

    this.studentApprovalStatus.set(submission.studentId, 'rejected');
    this.submissions.set(submissionId, submission);
    this.persistState();

    return submission;
  }

  private applyQuestionReview(
    submission: StudentIntakeSubmission,
    questionReviews: Record<string, 'correct' | 'wrong'> | undefined,
    requireCompleteReview: boolean,
  ) {
    const normalizedQuestions = submission.questions.map((question) => {
      const reviewStatus = questionReviews?.[question.questionId] ?? question.reviewStatus;
      return {
        ...question,
        reviewStatus,
      };
    });

    const hasPendingReview = normalizedQuestions.some((question) => question.reviewStatus === 'pending');
    if (requireCompleteReview && hasPendingReview) {
      throw new BadRequestException('Each entrance exam question must be marked correct or wrong before approval.');
    }

    const score = normalizedQuestions.filter((question) => question.reviewStatus === 'correct').length;

    submission.questions = normalizedQuestions;
    submission.entranceExamScore = hasPendingReview ? null : score;
    submission.entranceExamPassed = hasPendingReview ? null : score >= submission.passingScore;
  }

  private applyDocumentReview(
    submission: StudentIntakeSubmission,
    documentReviews: Record<string, 'approved' | 'rejected'> | undefined,
    requireCompleteReview: boolean,
  ) {
    const normalizedDocuments = submission.documents.map((document) => {
      const reviewStatus: IntakeDocumentReviewStatus =
        documentReviews?.[document.documentId] ?? document.reviewStatus;
      return {
        ...document,
        reviewStatus,
      };
    });

    const hasPendingRequiredReview = normalizedDocuments.some(
      (document) => document.required && document.reviewStatus === 'pending',
    );
    if (requireCompleteReview && hasPendingRequiredReview) {
      throw new BadRequestException('Each required document must be approved or rejected before approval.');
    }

    submission.documents = normalizedDocuments;
  }

  private loadState() {
    if (!existsSync(this.storagePath)) {
      return;
    }

    try {
      const raw = readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as {
        submissions?: StudentIntakeSubmission[];
        approvalStatuses?: Array<[string, 'pending' | 'approved' | 'rejected']>;
      };

      this.submissions = new Map(
        (parsed.submissions ?? []).map((submission) => {
          const normalizedQuestions =
            submission.questions?.map((question) => ({
              ...question,
              reviewStatus: question.reviewStatus ?? ('pending' as IntakeQuestionReviewStatus),
            })) ?? [];

          const normalizedDocuments =
            submission.documents?.map((document) => ({
              ...document,
              reviewStatus: document.reviewStatus ?? ('pending' as IntakeDocumentReviewStatus),
            })) ?? [];

          return [
            submission.id,
            {
              ...submission,
              entranceExamPassed: submission.entranceExamPassed ?? null,
              passingScore: submission.passingScore ?? normalizedQuestions.length,
              questions: normalizedQuestions,
              documents: normalizedDocuments,
            },
          ];
        }),
      );
      this.studentApprovalStatus = new Map(parsed.approvalStatuses ?? []);
    } catch {
      this.submissions = new Map();
      this.studentApprovalStatus = new Map();
    }
  }

  private persistState() {
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify(
        {
          submissions: Array.from(this.submissions.values()),
          approvalStatuses: Array.from(this.studentApprovalStatus.entries()),
        },
        null,
        2,
      ),
      'utf8',
    );
  }
}
