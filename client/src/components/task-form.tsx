import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type Task } from "@shared/schema";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: "todo" | "in_progress" | "done";
}

type FormValues = z.infer<typeof insertTaskSchema>;

export function TaskForm({ open, onOpenChange, task, defaultStatus = "todo" }: TaskFormProps) {
  const { toast } = useToast();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const isEditing = !!task;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
    },
  });

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description || "",
          status: task.status as FormValues["status"],
        });
      } else {
        form.reset({
          title: "",
          description: "",
          status: defaultStatus,
        });
      }
    }
  }, [open, task, defaultStatus, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && task) {
        await updateMutation.mutateAsync({ id: task.id, ...data });
        toast({ title: "Task updated successfully" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Task created successfully" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border/50 shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of your task below." 
              : "Fill in the details to add a new task to your board."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Design Landing Page" 
                      className="rounded-xl px-4 py-6 bg-muted/30 border-muted focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add more details about this task..." 
                      className="rounded-xl resize-none bg-muted/30 border-muted min-h-[100px] p-4 focus-visible:ring-primary/20" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl px-4 py-6 bg-muted/30 border-muted focus:ring-primary/20">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="todo" className="rounded-lg my-1">To Do</SelectItem>
                      <SelectItem value="in_progress" className="rounded-lg my-1">In Progress</SelectItem>
                      <SelectItem value="done" className="rounded-lg my-1">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl font-medium px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
