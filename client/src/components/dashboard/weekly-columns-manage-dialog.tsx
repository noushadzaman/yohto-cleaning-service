"use client";

import type { FormEvent, ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { WeeklyShowcaseColumnHeader } from "@/features/dashboard/weekly-showcase-types";
import { useIsDesktop } from "@/hooks/use-mobile";

type WeeklyColumnsManageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleHeaders: WeeklyShowcaseColumnHeader[];
  hiddenHeaders: WeeklyShowcaseColumnHeader[];
  newColumnLabel: string;
  onNewColumnLabelChange: (value: string) => void;
  error: string | null;
  isSubmitting?: boolean;
  onRemoveColumn: (columnKey: WeeklyShowcaseColumnHeader["columnKey"]) => void;
  onRestoreColumn: (columnKey: WeeklyShowcaseColumnHeader["columnKey"]) => void;
  onAddColumn: (event: FormEvent<HTMLFormElement>) => void;
};

function ColumnList({
  headers,
  emptyLabel,
  renderAction,
}: {
  headers: WeeklyShowcaseColumnHeader[];
  emptyLabel: string;
  renderAction: (header: WeeklyShowcaseColumnHeader) => ReactNode;
}) {
  if (headers.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="w-full max-w-full divide-y divide-border overflow-hidden rounded-md border border-border">
      {headers.map((header) => (
        <li key={header.columnKey} className="flex min-w-0 items-start gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-sm leading-snug">
            {header.label}
          </span>
          <div className="shrink-0">{renderAction(header)}</div>
        </li>
      ))}
    </ul>
  );
}

function ColumnListsSection({
  visibleHeaders,
  hiddenHeaders,
  isSubmitting,
  onRemoveColumn,
  onRestoreColumn,
  showAddBackLabel = false,
}: {
  visibleHeaders: WeeklyShowcaseColumnHeader[];
  hiddenHeaders: WeeklyShowcaseColumnHeader[];
  isSubmitting: boolean;
  onRemoveColumn: (columnKey: WeeklyShowcaseColumnHeader["columnKey"]) => void;
  onRestoreColumn: (columnKey: WeeklyShowcaseColumnHeader["columnKey"]) => void;
  showAddBackLabel?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-2">
        <Label>Visible columns</Label>
        <ColumnList
          headers={visibleHeaders}
          emptyLabel="No visible columns."
          renderAction={(header) => (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isSubmitting || visibleHeaders.length <= 1}
              onClick={() => onRemoveColumn(header.columnKey)}
              title={
                visibleHeaders.length <= 1
                  ? "At least one column must stay visible"
                  : "Remove column from table"
              }
            >
              <Trash2 className="size-4" aria-hidden />
              <span className="sr-only">Remove {header.label}</span>
            </Button>
          )}
        />
      </div>

      {hiddenHeaders.length > 0 ? (
        <div className="min-w-0 space-y-2">
          <Label>Hidden columns</Label>
          <ColumnList
            headers={hiddenHeaders}
            emptyLabel="No hidden columns."
            renderAction={(header) => (
              <Button
                type="button"
                variant="outline"
                size={showAddBackLabel ? "sm" : "icon-sm"}
                className={showAddBackLabel ? "h-8 px-2.5" : undefined}
                disabled={isSubmitting}
                onClick={() => onRestoreColumn(header.columnKey)}
                title={`Add back ${header.label}`}
              >
                <Plus className={showAddBackLabel ? "mr-1.5 size-4" : "size-4"} aria-hidden />
                {showAddBackLabel ? (
                  "Add back"
                ) : (
                  <span className="sr-only">Add back {header.label}</span>
                )}
              </Button>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

function AddColumnForm({
  newColumnLabel,
  onNewColumnLabelChange,
  error,
  isSubmitting,
  onAddColumn,
  stacked = false,
  inputId = "weekly-new-column-label",
}: {
  newColumnLabel: string;
  onNewColumnLabelChange: (value: string) => void;
  error: string | null;
  isSubmitting: boolean;
  onAddColumn: (event: FormEvent<HTMLFormElement>) => void;
  stacked?: boolean;
  inputId?: string;
}) {
  return (
    <form onSubmit={onAddColumn} className="min-w-0 space-y-2">
      <Label htmlFor={inputId}>Add custom column</Label>
      <div className={stacked ? "flex min-w-0 flex-col gap-2" : "flex min-w-0 gap-2"}>
        <Input
          id={inputId}
          className="min-w-0 flex-1"
          value={newColumnLabel}
          onChange={(event) => onNewColumnLabelChange(event.target.value)}
          disabled={isSubmitting}
          placeholder="New column header"
        />
        <Button
          type="submit"
          className={stacked ? "w-full shrink-0" : "shrink-0"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding…" : "Add"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}

export function WeeklyColumnsManageDialog({
  open,
  onOpenChange,
  visibleHeaders,
  hiddenHeaders,
  newColumnLabel,
  onNewColumnLabelChange,
  error,
  isSubmitting = false,
  onRemoveColumn,
  onRestoreColumn,
  onAddColumn,
}: WeeklyColumnsManageDialogProps) {
  const isDesktop = useIsDesktop();

  const listProps = {
    visibleHeaders,
    hiddenHeaders,
    isSubmitting,
    onRemoveColumn,
    onRestoreColumn,
  };

  const formProps = {
    newColumnLabel,
    onNewColumnLabelChange,
    error,
    isSubmitting,
    onAddColumn,
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>Manage columns</DialogTitle>
            <DialogDescription>
              Add or remove weekly showcase columns. Hidden columns keep their data and can be
              restored. Custom columns are deleted permanently when removed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
              <ColumnListsSection {...listProps} showAddBackLabel />
            </div>

            <div className="shrink-0 space-y-4 border-t border-border bg-muted/40 px-1 pt-4 pb-1">
              <AddColumnForm {...formProps} />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[92dvh] max-h-[92dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0 data-[side=bottom]:h-[92dvh] data-[side=bottom]:max-h-[92dvh]"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-border px-4 pb-3 pt-4 pr-12 text-left">
          <SheetTitle>Manage columns</SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            Hide, restore, or add weekly columns. Custom columns are deleted when removed.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-3 [-webkit-overflow-scrolling:touch]">
          <ColumnListsSection {...listProps} />
        </div>

        <div className="shrink-0 space-y-4 overflow-x-hidden border-t border-border bg-muted/40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4">
          <AddColumnForm {...formProps} stacked inputId="weekly-new-column-label-mobile" />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
