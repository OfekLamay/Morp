import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRuleSchema } from "@shared/schema";
import { useRules } from "@/hooks/use-rules";

interface CreateRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertRuleSchema.extend({
  itemsString: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRuleModal({ open, onOpenChange }: CreateRuleModalProps) {
  const { createRule } = useRules();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      enforcement: "SILENT",
      importance: 5,
      itemsString: "",
      userCreated: "",
      managerApproved: "",
      usersRelatedTo: [],
      enabled: true,
    },
  });

  function onSubmit(values: FormValues) {
    // Convert comma-separated string to array
    const itemsList = values.itemsString.split(',').map(item => item.trim());

    createRule.mutate({
      description: values.description,
      enforcement: values.enforcement,
      importance: values.importance,
      itemsList,
      userCreated: values.userCreated,
      managerApproved: values.managerApproved,
      usersRelatedTo: values.usersRelatedTo,
      enabled: values.enabled,
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card ">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Create New Rule</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Define a new detection rule for the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Describe the rule's purpose" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="enforcement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enforcement</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enforcement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SILENT">Silent</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity (1-10)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={10} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="itemsString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items List (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="shoes, jeans, t-shirt" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="userCreated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submitter</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Username of submitter" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="managerApproved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code Reviewer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Username of reviewer (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createRule.isPending}
              >
                {createRule.isPending ? "Creating..." : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
