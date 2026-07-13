import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';

const CONFIG_KEY = 'document-requirements-config';
const LEGACY_CONFIG_FILE = 'document-requirements-config.json';

export type DocumentAppliesTo = 'student' | 'instructor' | 'both';

export interface DocumentRequirementDefinition {
  id: string;
  name: string;
  description: string;
  appliesTo: DocumentAppliesTo;
  required: boolean;
}

export interface DocumentRequirementsConfig {
  documents: DocumentRequirementDefinition[];
}

const defaultDocumentRequirementsConfig: DocumentRequirementsConfig = {
  documents: [
    {
      id: 'photoId',
      name: 'Photo ID',
      description: 'A valid government-issued photo ID.',
      appliesTo: 'student',
      required: true,
    },
    {
      id: 'diploma',
      name: 'High School Diploma / Transcript',
      description: 'Proof of high school completion or equivalent.',
      appliesTo: 'student',
      required: true,
    },
    {
      id: 'tbTest',
      name: 'Physical + TB Clearance',
      description: 'Recent physical exam and TB clearance test results.',
      appliesTo: 'student',
      required: true,
    },
  ],
};

const VALID_APPLIES_TO: DocumentAppliesTo[] = ['student', 'instructor', 'both'];

@Injectable()
export class DocumentRequirementsConfigService implements OnModuleInit {
  private config: DocumentRequirementsConfig = defaultDocumentRequirementsConfig;

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  getConfig(): DocumentRequirementsConfig {
    return this.config;
  }

  findDocument(documentId: string): DocumentRequirementDefinition | undefined {
    return this.config.documents.find((document) => document.id === documentId);
  }

  getDocumentsFor(role: 'student' | 'instructor'): DocumentRequirementDefinition[] {
    return this.config.documents.filter(
      (document) => document.appliesTo === role || document.appliesTo === 'both',
    );
  }

  updateConfig(newConfig: DocumentRequirementsConfig): DocumentRequirementsConfig {
    this.config = this.normalizeConfig(newConfig);
    this.persistConfig();
    return this.config;
  }

  resetToDefault(): DocumentRequirementsConfig {
    this.config = defaultDocumentRequirementsConfig;
    this.persistConfig();
    return this.config;
  }

  private normalizeConfig(rawConfig: DocumentRequirementsConfig): DocumentRequirementsConfig {
    if (!rawConfig || !Array.isArray(rawConfig.documents)) {
      throw new BadRequestException('Document requirements configuration must contain a "documents" array.');
    }

    const seenIds = new Set<string>();
    const documents = rawConfig.documents.map((document, index) => {
      const id = String(document.id ?? '').trim();
      const name = String(document.name ?? '').trim();

      if (!id || !name) {
        throw new BadRequestException(`Document at position ${index + 1} requires both an id and a name.`);
      }

      if (seenIds.has(id)) {
        throw new BadRequestException(`Duplicate document id "${id}".`);
      }
      seenIds.add(id);

      const appliesTo = document.appliesTo;
      if (!VALID_APPLIES_TO.includes(appliesTo)) {
        throw new BadRequestException(
          `Document "${name}" has an invalid "appliesTo" value. Expected one of: ${VALID_APPLIES_TO.join(', ')}.`,
        );
      }

      return {
        id,
        name,
        description: String(document.description ?? '').trim(),
        appliesTo,
        required: Boolean(document.required),
      } satisfies DocumentRequirementDefinition;
    });

    return { documents };
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<DocumentRequirementsConfig>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.config = stored;
        return;
      }
    } catch {
      // Fall through to defaults on unreadable/corrupt stored config.
    }

    this.config = defaultDocumentRequirementsConfig;
    this.persistConfig();
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }
}
