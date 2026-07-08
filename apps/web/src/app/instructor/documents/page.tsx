'use client';

import * as React from 'react';
import { IconEye, IconPlus, IconSearch, IconUpload, IconX } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type DocumentStatus = 'Approved' | 'Pending' | 'Needs update';

interface InstructorDocument {
  id: string;
  name: string;
  category: string;
  owner: string;
  updated: string;
  status: DocumentStatus;
  fileName?: string;
  fileUrl?: string;
}

const statusOptions: DocumentStatus[] = ['Approved', 'Pending', 'Needs update'];

export default function InstructorDocumentsPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [documents, setDocuments] = React.useState<InstructorDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<DocumentStatus | null>(null);
  const [previewDocument, setPreviewDocument] = React.useState<{ title: string; fileUrl: string } | null>(null);

  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadName, setUploadName] = React.useState('');
  const [uploadCategory, setUploadCategory] = React.useState('');
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const replaceFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingReplaceDocumentIdRef = React.useRef<string | null>(null);
  const [replacingDocumentId, setReplacingDocumentId] = React.useState<string | null>(null);

  const fetchDocuments = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your documents.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/documents`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch documents (${response.status}).`);
      }

      const data = await response.json();
      setDocuments(data.data ?? []);
    } catch (err) {
      setDocuments([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || document.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const approvedCount = documents.filter((document) => document.status === 'Approved').length;
  const pendingCount = documents.filter((document) => document.status === 'Pending').length;
  const needsUpdateCount = documents.filter((document) => document.status === 'Needs update').length;

  const submitUpload = async () => {
    if (!instructorId || !accessToken || !uploadName.trim() || !uploadCategory.trim() || !uploadFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append('name', uploadName.trim());
      formData.append('category', uploadCategory.trim());
      formData.append('file', uploadFile);

      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to upload document (${response.status}).`);
      }

      const data = await response.json();
      setDocuments((current) => [data.data, ...current]);
      setShowUploadModal(false);
      setUploadName('');
      setUploadCategory('');
      setUploadFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleRequestReplace = (documentId: string) => {
    pendingReplaceDocumentIdRef.current = documentId;
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const documentId = pendingReplaceDocumentIdRef.current;
    event.target.value = '';
    if (!file || !documentId || !instructorId || !accessToken) return;

    try {
      setReplacingDocumentId(documentId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/documents/${documentId}/replace`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to replace document (${response.status}).`);
      }

      const data = await response.json();
      setDocuments((current) => current.map((document) => (document.id === documentId ? data.data : document)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace document.');
    } finally {
      setReplacingDocumentId(null);
    }
  };

  const columns: DataTableColumn<InstructorDocument>[] = [
    { id: 'name', header: 'Document', accessorKey: 'name' },
    { id: 'category', header: 'Category', accessorKey: 'category' },
    { id: 'owner', header: 'Owner', accessorKey: 'owner' },
    { id: 'updated', header: 'Updated', accessorKey: 'updated' },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center justify-center gap-2">
          {row.fileUrl ? (
            <button
              onClick={() => setPreviewDocument({ title: row.fileName ?? row.name, fileUrl: row.fileUrl as string })}
              className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-primary"
              title="View"
            >
              <IconEye className="size-4" />
            </button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="rounded-[10px]"
            disabled={replacingDocumentId === row.id}
            onClick={() => handleRequestReplace(row.id)}
          >
            {replacingDocumentId === row.id ? 'Replacing...' : 'Replace'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <InstructorShell
      title="Documents Center"
      subtitle="Central access to instructor compliance files, placement records, and operating documents."
      topActions={
        <Button className="hidden rounded-[16px] px-5 md:inline-flex" onClick={() => setShowUploadModal(true)}>
          <IconUpload className="size-4" />
          Upload document
        </Button>
      }
    >
      <div className="grid gap-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Approved files</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-success">{approvedCount}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs review</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs update</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-error">{needsUpdateCount}</p>
          </div>
        </div>

        <input
          ref={replaceFileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleReplaceFileSelected}
        />

        <DataTable
          columns={columns}
          data={filteredDocuments}
          mobileCardTitle={(row) => row.name}
          mobileCardSubtitle={(row) => `${row.category} / ${row.owner}`}
          emptyState={loading ? 'Loading documents...' : 'No documents uploaded yet.'}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  placeholder="Search documents..."
                  className="h-11 rounded-[16px] pl-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    !filterStatus
                      ? 'bg-primary text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-primary',
                  )}
                >
                  All types
                </button>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      filterStatus === status
                        ? status === 'Approved'
                          ? 'bg-success text-white'
                          : status === 'Pending'
                            ? 'bg-warning text-white'
                            : 'bg-error text-white'
                        : 'border border-border-subtle bg-surface text-on-surface hover:border-primary',
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {showUploadModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            {uploadError ? (
              <div className="mb-4 rounded-[12px] border border-error/20 bg-error/5 p-3 text-sm text-error">
                {uploadError}
              </div>
            ) : null}

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Document Name</label>
                <Input
                  value={uploadName}
                  onChange={(event) => setUploadName(event.target.value)}
                  placeholder="e.g., Instructor Credential Packet"
                  className="rounded-[12px]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Category</label>
                <Input
                  value={uploadCategory}
                  onChange={(event) => setUploadCategory(event.target.value)}
                  placeholder="e.g., Compliance"
                  className="rounded-[12px]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">File</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-[10px] file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)} className="flex-1 rounded-[12px]">
                Cancel
              </Button>
              <Button
                onClick={() => void submitUpload()}
                disabled={!uploadName.trim() || !uploadCategory.trim() || !uploadFile || uploading}
                className="flex-1 gap-2 rounded-[12px]"
              >
                <IconPlus className="size-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {previewDocument ? (
        <DocumentPreviewModal
          title={previewDocument.title}
          fileUrl={previewDocument.fileUrl}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </InstructorShell>
  );
}
