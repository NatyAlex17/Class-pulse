import * as path from 'path';

export const UPLOADS_DIR = path.join(process.cwd(), '.data', 'uploads');
export const UPLOADS_URL_PREFIX = '/uploads';
export const LEARNING_RESOURCES_UPLOADS_DIR = path.join(UPLOADS_DIR, 'learning-resources');
export const READINESS_DOCUMENTS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'readiness-documents');
