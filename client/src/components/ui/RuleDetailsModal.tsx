import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { formatDate } from "@/lib/utils";
import { Rule } from "@shared/schema";

export default function RuleDetailsModal({ rule, open, onOpenChange }: {
  rule: Rule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rule Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div><b>ID:</b> {rule.id}</div>
          <div>
            <b>Status:</b>{" "}
            {rule.enabled ? (
              <span className="text-green-600 font-semibold">Enabled</span>
            ) : (
              <span className="text-red-500 font-semibold">Disabled</span>
            )}
          </div>
          <div>
            <b>Enforcement:</b>{" "}
            <StatusBadge status={rule.enabled ? rule.enforcement : "Disabled"} type="enforcement" />
          </div>
          <div>
            <b>Description:</b> {rule.description}
          </div>
          <div>
            <b>Severity:</b> <SeverityIndicator severity={rule.severity} />
          </div>
          <div>
            <b>Submitter:</b> {rule.userCreated}
          </div>
          <div>
            <b>Code Reviewer:</b> {rule.managerApproved || "pending"}
          </div>
          <div>
            <b>Created:</b> {formatDate(rule.creationDate)}
          </div>
          <div>
            <b>Items List:</b>
            <ul className="list-disc list-inside ml-4">
              {rule.itemsList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}