'use client';

import * as React from 'react';
import { IconAlertCircle, IconFileTypePdf, IconUpload, IconVideo, IconX } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

type UploadKind = 'video' | 'pdf';

type KindConfig = {
  accept: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  validate: (file: File) => boolean;
};

// Mirrors the API's upload filter (video/* or application/pdf, 500 MB limit).
const DEFAULT_MAX_SIZE_MB = 500;

const kindConfigs: Record<UploadKind, KindConfig> = {
  video: {
    accept: 'video/*',
    label: 'video',
    hint: 'MP4, WebM, and other video formats',
    icon: IconVideo,
    validate: (file) => file.type.startsWith('video/'),
  },
  pdf: {
    accept: 'application/pdf,.pdf',
    label: 'PDF',
    hint: 'PDF documents only',
    icon: IconFileTypePdf,
    validate: (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
  },
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Embedded players (YouTube/Vimeo) can't render in a <video> tag.
function isPreviewableUrl(kind: UploadKind, url: string) {
  if (kind === 'pdf') {
    return true;
  }
  return !/youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export type FileUploaderProps = {
  kind: UploadKind;
  /**
   * Deferred mode: controlled selected file — the parent keeps the file and
   * uploads it later (e.g. on form submit). Pass together with onFileSelect.
   */
  file?: File | null;
  onFileSelect?: (file: File | null) => void;
  /**
   * Immediate mode: called as soon as a valid file is chosen; the component
   * shows its own uploading state and surfaces thrown errors inline.
   */
  onUpload?: (file: File) => Promise<void>;
  /** Existing remote file URL, previewed when no local file is selected. */
  previewUrl?: string;
  maxSizeMB?: number;
  disabled?: boolean;
};

export function FileUploader({
  kind,
  file,
  onFileSelect,
  onUpload,
  previewUrl,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled,
}: FileUploaderProps) {
  const config = kindConfigs[kind];
  const KindIcon = config.icon;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalFile, setInternalFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const controlled = file !== undefined;
  const activeFile = controlled ? file : internalFile;

  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!activeFile) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(activeFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [activeFile]);

  const previewSrc =
    localPreview ?? (previewUrl && isPreviewableUrl(kind, previewUrl) ? previewUrl : null);

  const selectFile = (candidate: File | null) => {
    if (controlled) {
      onFileSelect?.(candidate);
    } else {
      setInternalFile(candidate);
    }
  };

  const handleFile = async (candidate: File) => {
    setError(null);

    if (!config.validate(candidate)) {
      setError(`"${candidate.name}" is not a valid ${config.label} file. ${config.hint}.`);
      return;
    }

    if (candidate.size > maxSizeMB * 1024 * 1024) {
      setError(
        `"${candidate.name}" is too large (${formatFileSize(candidate.size)}). Maximum size is ${maxSizeMB} MB.`,
      );
      return;
    }

    selectFile(candidate);

    if (onUpload) {
      try {
        setUploading(true);
        await onUpload(candidate);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload file.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled && !uploading) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !disabled && !uploading) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled || uploading) {
            return;
          }
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) {
            void handleFile(dropped);
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed p-6 text-center transition',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border-subtle bg-surface-muted/40 hover:border-primary/50 hover:bg-primary/5',
          (disabled || uploading) && 'pointer-events-none opacity-60',
        )}
      >
        <IconUpload className="size-6 text-primary" />
        <p className="text-sm font-semibold text-on-surface">
          {uploading ? 'Uploading...' : `Click to choose a ${config.label} file, or drag it here`}
        </p>
        <p className="text-xs text-on-surface-variant">
          {config.hint} • up to {maxSizeMB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            if (chosen) {
              void handleFile(chosen);
            }
            event.target.value = '';
          }}
        />
      </div>

      {error ? (
        <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-error/20 bg-error/10 p-2.5 text-xs text-error">
          <IconAlertCircle className="size-4 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      ) : null}

      {activeFile ? (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-[10px] border border-border-subtle bg-surface p-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <KindIcon className="size-4 shrink-0 text-primary" />
            <p className="truncate text-xs font-medium text-on-surface">{activeFile.name}</p>
            <span className="shrink-0 text-xs text-on-surface-variant">{formatFileSize(activeFile.size)}</span>
          </div>
          {uploading ? (
            <span className="shrink-0 text-xs text-on-surface-variant">Uploading...</span>
          ) : (
            <button
              type="button"
              title="Remove file"
              onClick={() => {
                selectFile(null);
                setError(null);
              }}
              className="shrink-0 rounded-[8px] p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
      ) : null}

      {previewSrc ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Preview
          </p>
          {kind === 'video' ? (
            <video
              key={previewSrc}
              controls
              src={previewSrc}
              className="max-h-64 w-full rounded-[14px] border border-border-subtle bg-black"
            />
          ) : (
            <iframe
              key={previewSrc}
              src={previewSrc}
              title="PDF preview"
              className="h-64 w-full rounded-[14px] border border-border-subtle bg-surface"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
