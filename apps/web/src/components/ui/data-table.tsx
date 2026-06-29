import * as React from 'react';
import { IconLayoutList, IconTable } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type TableValue = string | number | boolean | React.ReactNode | null | undefined;

function readAccessor<TData>(row: TData, accessorKey?: keyof TData): TableValue {
  if (!accessorKey) {
    return undefined;
  }

  return row[accessorKey] as TableValue;
}

export interface DataTableColumn<TData> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof TData;
  cell?: (row: TData) => React.ReactNode;
  mobileLabel?: React.ReactNode;
  mobileValue?: (row: TData) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  mobileHidden?: boolean;
}

export interface DataTableClassNames {
  root?: string;
  toolbar?: string;
  desktopWrapper?: string;
  table?: string;
  headerRow?: string;
  headerCell?: string;
  row?: string;
  cell?: string;
  mobileList?: string;
  mobileCard?: string;
  mobileCardHeader?: string;
  mobileCardTitle?: string;
  mobileCardSubtitle?: string;
  mobileGrid?: string;
  mobileItem?: string;
  mobileItemLabel?: string;
  mobileItemValue?: string;
  emptyState?: string;
}

export interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  getRowClassName?: (row: TData, index: number) => string | undefined;
  onRowClick?: (row: TData) => void;
  rowActions?: (row: TData) => React.ReactNode;
  renderToolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  mobileCardTitle?: (row: TData) => React.ReactNode;
  mobileCardSubtitle?: (row: TData) => React.ReactNode;
  classNames?: DataTableClassNames;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  getRowClassName,
  onRowClick,
  rowActions,
  renderToolbar,
  emptyState,
  mobileCardTitle,
  mobileCardSubtitle,
  classNames,
}: DataTableProps<TData>) {
  const hasData = data.length > 0;
  const interactiveRows = Boolean(onRowClick);

  if (!hasData) {
    return (
      <div
        className={cn(
          'rounded-[20px] border border-dashed border-outline-variant bg-white/70 p-10 text-center text-sm text-on-surface-variant',
          classNames?.emptyState,
        )}
      >
        {emptyState ?? 'No records available.'}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', classNames?.root)}>
      {renderToolbar ? (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-[18px] border border-white/70 bg-white/75 p-4 md:flex-row md:items-center md:justify-between',
            classNames?.toolbar,
          )}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-low px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-on-surface-variant">
            <IconTable className="size-3.5" />
            Desktop table
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-low px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-on-surface-variant md:hidden">
            <IconLayoutList className="size-3.5" />
            Mobile cards
          </div>
          <div className="flex-1 md:flex-none">{renderToolbar}</div>
        </div>
      ) : null}

      <div
        className={cn(
          'hidden overflow-hidden rounded-[20px] border border-white/70 bg-white/80 shadow-soft md:block',
          classNames?.desktopWrapper,
        )}
      >
        <table className={cn('min-w-full border-collapse', classNames?.table)}>
          <thead>
            <tr className={cn('border-b border-border-subtle', classNames?.headerRow)}>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant',
                    classNames?.headerCell,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th className={cn('px-4 py-3 text-right', classNames?.headerCell)}>Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const resolvedRowClassName = getRowClassName?.(row, index);
              const rowId = getRowId?.(row, index) ?? String(index);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'border-b border-border-subtle/80 last:border-b-0',
                    interactiveRows && 'cursor-pointer transition hover:bg-surface-muted',
                    classNames?.row,
                    resolvedRowClassName,
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4 py-4 align-top text-sm text-on-surface',
                        classNames?.cell,
                        column.cellClassName,
                      )}
                    >
                      {column.cell ? column.cell(row) : readAccessor(row, column.accessorKey)}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className={cn('px-4 py-4 text-right', classNames?.cell)}>{rowActions(row)}</td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={cn('grid gap-4 md:hidden', classNames?.mobileList)}>
        {data.map((row, index) => {
          const resolvedRowClassName = getRowClassName?.(row, index);
          const rowId = getRowId?.(row, index) ?? String(index);

          return (
            <div
              key={rowId}
              className={cn(
                'rounded-[20px] border border-white/70 bg-white/85 p-4 shadow-soft',
                interactiveRows && 'cursor-pointer transition hover:-translate-y-0.5',
                classNames?.mobileCard,
                resolvedRowClassName,
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <div className={cn('mb-4 flex items-start justify-between gap-3', classNames?.mobileCardHeader)}>
                <div>
                  <div className={cn('font-display text-base font-semibold', classNames?.mobileCardTitle)}>
                    {mobileCardTitle?.(row) ??
                      columns[0]?.cell?.(row) ??
                      readAccessor(row, columns[0]?.accessorKey)}
                  </div>
                  {mobileCardSubtitle ? (
                    <div className={cn('mt-1 text-sm text-on-surface-variant', classNames?.mobileCardSubtitle)}>
                      {mobileCardSubtitle(row)}
                    </div>
                  ) : null}
                </div>
                {rowActions ? <div onClick={(event) => event.stopPropagation()}>{rowActions(row)}</div> : null}
              </div>

              <div className={cn('grid gap-3', classNames?.mobileGrid)}>
                {columns
                  .filter((column) => !column.mobileHidden)
                  .map((column) => (
                    <div
                      key={column.id}
                      className={cn(
                        'rounded-[16px] border border-border-subtle/70 bg-surface-muted px-3.5 py-3',
                        classNames?.mobileItem,
                      )}
                    >
                      <div
                        className={cn(
                          'font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant',
                          classNames?.mobileItemLabel,
                        )}
                      >
                        {column.mobileLabel ?? column.header}
                      </div>
                      <div className={cn('mt-1 text-sm text-on-surface', classNames?.mobileItemValue)}>
                        {column.mobileValue
                          ? column.mobileValue(row)
                          : column.cell
                            ? column.cell(row)
                            : readAccessor(row, column.accessorKey)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
