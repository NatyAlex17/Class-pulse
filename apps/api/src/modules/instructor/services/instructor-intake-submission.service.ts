import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  InstructorIntakeApprovalStatus,
  InstructorIntakeDocumentReviewStatus,
  InstructorIntakeSubmission,
  SubmitInstructorIntakeDto,
} from '../types/instructor-portal.types';

@Injectable()
export class InstructorIntakeSubmissionService {
  private readonly storagePath = join(process.cwd(), '.data', 'instructor-intake-submissions.json');
  private submissions: Map<string, InstructorIntakeSubmission> = new Map();
  private instructorApprovalStatus: Map<string, InstructorIntakeApprovalStatus> = new Map();

  constructor() {
    this.loadState();
  }

  submitIntake(instructorId: string, data: SubmitInstructorIntakeDto): InstructorIntakeSubmission {
    const existing = this.getInstructorSubmission(instructorId);
    const submission: InstructorIntakeSubmission = {
      id: existing?.id ?? `instructor-submission-${Date.now()}`,
      instructorId,
      status: 'pending',
      questions: data.questions,
      documents: data.documents,
      agreedToTerms: data.agreedToTerms,
      selectedModuleIds: data.selectedModuleIds,
      submittedAt: new Date().toISOString(),
      approvedAt: undefined,
      rejectionReason: undefined,
      reviewedBy: undefined,
    };

    this.submissions.set(submission.id, submission);
    this.instructorApprovalStatus.set(instructorId, 'pending');
    this.persistState();

    return submission;
  }

  getInstructorApprovalStatus(instructorId: string): InstructorIntakeApprovalStatus | null {
    return this.instructorApprovalStatus.get(instructorId) || null;
  }

  getSubmission(submissionId: string): InstructorIntakeSubmission | undefined {
    return this.submissions.get(submissionId);
  }

  getInstructorSubmission(instructorId: string): InstructorIntakeSubmission | undefined {
    for (const submission of this.submissions.values()) {
      if (submission.instructorId === instructorId) {
        return submission;
      }
    }
    return undefined;
  }

  getPendingSubmissions(): InstructorIntakeSubmission[] {
    return Array.from(this.submissions.values()).filter((s) => s.status === 'pending');
  }

  getAllSubmissions(): InstructorIntakeSubmission[] {
    return Array.from(this.submissions.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  approveIntake(
    submissionId: string,
    adminId: string,
    documentReviews?: Record<string, InstructorIntakeDocumentReviewStatus>,
  ): InstructorIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new BadRequestException('Submission not found.');
    }

    this.applyDocumentReview(submission, documentReviews, true);
    submission.status = 'approved';
    submission.approvedAt = new Date().toISOString();
    submission.reviewedBy = adminId;
    submission.rejectionReason = undefined;

    this.instructorApprovalStatus.set(submission.instructorId, 'approved');
    this.submissions.set(submissionId, submission);
    this.persistState();

    return submission;
  }

  rejectIntake(
    submissionId: string,
    adminId: string,
    reason: string,
    documentReviews?: Record<string, InstructorIntakeDocumentReviewStatus>,
  ): InstructorIntakeSubmission {
    const submission = this.submissions.get(submissionId);

    if (!submission) {
      throw new BadRequestException('Submission not found.');
    }

    this.applyDocumentReview(submission, documentReviews, false);
    submission.status = 'rejected';
    submission.rejectionReason = reason;
    submission.reviewedBy = adminId;
    submission.approvedAt = undefined;

    this.instructorApprovalStatus.set(submission.instructorId, 'rejected');
    this.submissions.set(submissionId, submission);
    this.persistState();

    return submission;
  }

  private applyDocumentReview(
    submission: InstructorIntakeSubmission,
    documentReviews: Record<string, InstructorIntakeDocumentReviewStatus> | undefined,
    requireCompleteReview: boolean,
  ) {
    const normalizedDocuments = submission.documents.map((document) => {
      const reviewStatus: InstructorIntakeDocumentReviewStatus =
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
        submissions?: InstructorIntakeSubmission[];
        approvalStatuses?: Array<[string, InstructorIntakeApprovalStatus]>;
      };

      this.submissions = new Map(
        (parsed.submissions ?? []).map((submission) => {
          const normalizedDocuments =
            submission.documents?.map((document) => ({
              ...document,
              reviewStatus: document.reviewStatus ?? ('pending' as InstructorIntakeDocumentReviewStatus),
            })) ?? [];

          return [submission.id, { ...submission, documents: normalizedDocuments }];
        }),
      );
      this.instructorApprovalStatus = new Map(parsed.approvalStatuses ?? []);
    } catch {
      this.submissions = new Map();
      this.instructorApprovalStatus = new Map();
    }
  }

  private persistState() {
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify(
        {
          submissions: Array.from(this.submissions.values()),
          approvalStatuses: Array.from(this.instructorApprovalStatus.entries()),
        },
        null,
        2,
      ),
      'utf8',
    );
  }
}
