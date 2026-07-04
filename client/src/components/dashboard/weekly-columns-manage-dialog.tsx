import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeeklyShowcaseColumnHeader } from "@/features/dashboard/weekly-showcase-types";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage columns</DialogTitle>
          <DialogDescription>
            Add or remove weekly showcase columns. Hidden columns keep their data and can be
            restored. Custom columns are deleted permanently when removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Visible columns</Label>
            {visibleHeaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visible columns.</p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {visibleHeaders.map((header) => (
                  <li
                    key={header.columnKey}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span className="text-sm">{header.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hiddenHeaders.length > 0 ? (
            <div className="space-y-2">
              <Label>Hidden columns</Label>
              <ul className="divide-y divide-border rounded-md border border-border">
                {hiddenHeaders.map((header) => (
                  <li
                    key={header.columnKey}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">{header.label}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => onRestoreColumn(header.columnKey)}
                    >
                      <Plus className="mr-1.5 size-4" aria-hidden />
                      Add back
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <form onSubmit={onAddColumn} className="space-y-2">
            <Label htmlFor="weekly-new-column-label">Add custom column</Label>
            <div className="flex gap-2">
              <Input
                id="weekly-new-column-label"
                value={newColumnLabel}
                onChange={(event) => onNewColumnLabelChange(event.target.value)}
                disabled={isSubmitting}
                placeholder="New column header"
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="-mx-0 -mb-0 p-0 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
