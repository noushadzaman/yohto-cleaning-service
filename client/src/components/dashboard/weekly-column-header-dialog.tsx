import type { FormEvent } from "react";
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

type WeeklyColumnHeaderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header: WeeklyShowcaseColumnHeader | null;
  labelValue: string;
  onLabelChange: (value: string) => void;
  error: string | null;
  isSubmitting?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function WeeklyColumnHeaderDialog({
  open,
  onOpenChange,
  header,
  labelValue,
  onLabelChange,
  error,
  isSubmitting = false,
  onSubmit,
}: WeeklyColumnHeaderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit column header</DialogTitle>
          <DialogDescription>
            {header
              ? `Update the label for “${header.label}”. Changes apply to all weeks.`
              : "Update column header."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekly-column-header-label">Header label</Label>
            <Input
              id="weekly-column-header-label"
              value={labelValue}
              onChange={(event) => onLabelChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="Column title"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter className="-mx-0 -mb-0 p-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save header"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
