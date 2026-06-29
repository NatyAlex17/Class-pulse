'use client';

import * as React from 'react';
import { IconAsterisk } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type PrimitiveValue = string | number | boolean;

export interface FormFieldOption {
  label: string;
  value: string;
  hint?: string;
}

interface BaseField {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  inputClassName?: string;
}

export interface TextLikeField extends BaseField {
  type: 'text' | 'email' | 'number' | 'date';
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: FormFieldOption[];
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
}

export interface CustomField extends BaseField {
  type: 'custom';
  render: (context: {
    value: PrimitiveValue | undefined;
    error?: string;
    onChange: (value: PrimitiveValue) => void;
  }) => React.ReactNode;
}

export type FormField = TextLikeField | TextareaField | SelectField | CheckboxField | CustomField;

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  columns?: 1 | 2;
  fields: FormField[];
  className?: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  sections: FormSection[];
}

export interface FormDesignerClassNames {
  root?: string;
  header?: string;
  section?: string;
  sectionHeader?: string;
  sectionGrid?: string;
  field?: string;
  fieldLabel?: string;
  fieldDescription?: string;
  fieldError?: string;
  actions?: string;
}

export interface FormDesignerProps {
  schema: FormSchema;
  values: Record<string, PrimitiveValue | undefined>;
  errors?: Record<string, string | undefined>;
  onChange: (name: string, value: PrimitiveValue) => void;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  secondaryAction?: React.ReactNode;
  footer?: React.ReactNode;
  classNames?: FormDesignerClassNames;
}

function renderField(
  field: FormField,
  value: PrimitiveValue | undefined,
  onChange: (value: PrimitiveValue) => void,
) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <Input
          id={field.name}
          type={field.type}
          value={typeof value === 'boolean' ? '' : (value ?? '')}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={field.inputClassName}
          onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)}
        />
      );
    case 'textarea':
      return (
        <Textarea
          id={field.name}
          rows={field.rows ?? 5}
          value={typeof value === 'boolean' ? '' : (value ?? '')}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={field.inputClassName}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'select':
      return (
        <Select
          id={field.name}
          value={typeof value === 'boolean' ? '' : (value ?? '')}
          placeholder={field.placeholder}
          options={field.options}
          disabled={field.disabled}
          className={field.inputClassName}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'checkbox':
      return (
        <div className="rounded-[16px] border border-border-subtle bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-on-surface">{field.label}</div>
              {field.description ? (
                <div className="mt-1 text-sm text-on-surface-variant">{field.description}</div>
              ) : null}
            </div>
            <Checkbox
              checked={Boolean(value)}
              disabled={field.disabled}
              onChange={(event) => onChange(event.target.checked)}
            />
          </div>
        </div>
      );
    case 'custom':
      return field.render({
        value,
        onChange,
      });
  }
}

export function FormDesigner({
  schema,
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel = 'Save changes',
  secondaryAction,
  footer,
  classNames,
}: FormDesignerProps) {
  return (
    <Card className={cn('overflow-hidden', classNames?.root)}>
      <CardHeader className={cn('border-b border-border-subtle bg-white/80', classNames?.header)}>
        <CardTitle>{schema.title}</CardTitle>
        {schema.description ? <CardDescription>{schema.description}</CardDescription> : null}
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={onSubmit}>
          <div className="space-y-5 p-5 sm:p-6">
            {schema.sections.map((section) => (
              <section
                key={section.id}
                className={cn(
                  'rounded-[20px] border border-border-subtle bg-white/80 p-5',
                  classNames?.section,
                  section.className,
                )}
              >
                <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', classNames?.sectionHeader)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-semibold tracking-[-0.02em] text-on-surface">
                        {section.title}
                      </h4>
                      {section.badge ? <Badge variant="primary">{section.badge}</Badge> : null}
                    </div>
                    {section.description ? (
                      <p className="mt-1 text-sm text-on-surface-variant">{section.description}</p>
                    ) : null}
                  </div>
                </div>

                <div
                  className={cn(
                    'grid gap-4',
                    section.columns === 2 && 'md:grid-cols-2',
                    classNames?.sectionGrid,
                  )}
                >
                  {section.fields.map((field) => {
                    const error = errors?.[field.name];
                    const value = values[field.name];
                    const isCheckbox = field.type === 'checkbox';

                    return (
                      <div key={field.name} className={cn('space-y-2', classNames?.field, field.className)}>
                        {!isCheckbox ? (
                          <label
                            htmlFor={field.name}
                            className={cn(
                              'flex items-center gap-1 text-sm font-medium text-on-surface',
                              classNames?.fieldLabel,
                              field.labelClassName,
                            )}
                          >
                            <span>{field.label}</span>
                            {field.required ? <IconAsterisk className="size-3 text-error" /> : null}
                          </label>
                        ) : null}

                        {field.type !== 'checkbox' && field.description ? (
                          <p
                            className={cn(
                              'text-sm text-on-surface-variant',
                              classNames?.fieldDescription,
                              field.descriptionClassName,
                            )}
                          >
                            {field.description}
                          </p>
                        ) : null}

                        {renderField(field, value, (nextValue) => onChange(field.name, nextValue))}

                        {error ? (
                          <p className={cn('text-sm text-error', classNames?.fieldError)}>{error}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div
            className={cn(
              'flex flex-col gap-3 border-t border-border-subtle bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6',
              classNames?.actions,
            )}
          >
            <div className="text-sm text-on-surface-variant">{footer}</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {secondaryAction}
              <Button type="submit">{submitLabel}</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
