'use client';

import { IconX } from '@tabler/icons-react';

type DocumentPreviewModalProps = {
  title: string;
  fileUrl: string;
  onClose: () => void;
};

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

export function DocumentPreviewModal({ title, fileUrl, onClose }: DocumentPreviewModalProps) {
  const isImage = IMAGE_EXTENSION_PATTERN.test(fileUrl);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-surface shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <p className="truncate text-sm font-semibold text-on-surface">{title}</p>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-on-surface-variant transition hover:bg-surface-muted hover:text-on-surface"
            >
              <IconX className="size-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-surface-muted p-4">
          {isImage ? (
            <img src={fileUrl} alt={title} className="mx-auto max-h-full max-w-full rounded-[12px] object-contain" />
          ) : (
            <iframe title={title} src={fileUrl} className="h-[70vh] w-full rounded-[12px] bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}
