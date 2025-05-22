import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRules } from "@/hooks/use-rules";
import { Rule } from "@shared/schema";

const editRuleSchema = z.object({
  description: z.string().min(1, "Required"),
  enforcement: z.enum(["SILENT", "ACTIVE"]),
  severity: z.number().min(1).max(10),
  enabled: z.boolean(),
});

type EditRuleFormValues = z.infer<typeof editRuleSchema>;

export default function EditRuleModal({
  rule,
  open,
  onOpenChange,
}: {
  rule: Rule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateRule } = useRules();
  const form = useForm<EditRuleFormValues>({
    resolver: zodResolver(editRuleSchema),
    defaultValues: {
      description: rule?.description || "",
      enforcement: rule?.enforcement || "SILENT",
      severity: rule?.severity || 5,
      enabled: rule?.enabled ?? true,
    },
  });

  // Update form values when rule changes
  useEffect(() => {
    if (rule) {
      form.reset({
        description: rule.description,
        enforcement: rule.enforcement,
        severity: rule.severity,
        enabled: rule.enabled,
      });
    }
  }, [rule, form]);

  function onSubmit(values: EditRuleFormValues) {
    if (!rule) return;
    updateRule.mutate(
      { id: rule.id, ...values },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <Input {...form.register("description")} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Enforcement</label>
            <Select
              value={form.watch("enforcement")}
              onValueChange={val => form.setValue("enforcement", val as "SILENT" | "ACTIVE")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select enforcement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SILENT">Silent</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Severity (1-10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              {...form.register("severity", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <Select
              value={form.watch("enabled") ? "enabled" : "disabled"}
              onValueChange={val => form.setValue("enabled", val === "enabled")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRule.isPending}>
              {updateRule.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}