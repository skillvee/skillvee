"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const createDomainSchema = z.object({
  name: z.string().min(1, "Domain name is required").max(100, "Name too long"),
});

type CreateDomainForm = z.infer<typeof createDomainSchema>;

interface CreateDomainFormProps {
  onClose: () => void;
}

export function CreateDomainForm({ onClose }: CreateDomainFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDomainForm>({
    resolver: zodResolver(createDomainSchema),
  });

  // tRPC mutations
  const utils = api.useUtils();
  const createDomain = api.skills.createDomain.useMutation({
    onSuccess: async (data) => {
      toast.success(`Domain "${data.name}" created successfully!`);
      
      // Invalidate related queries to refresh the UI
      await utils.skills.listDomains.invalidate();
      await utils.skills.getStats.invalidate();
      await utils.skills.getHierarchy.invalidate();
      
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating domain:", error);
      toast.error(error.message || "Failed to create domain");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateDomainForm) => {
    setIsSubmitting(true);
    createDomain.mutate(data);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Create New Domain
        </DialogTitle>
        <DialogDescription>
          Add a new knowledge domain to organize skills and competencies. 
          Domains represent high-level areas like "Technical Skills" or "Cognitive Abilities".
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Domain Name</Label>
          <Input
            id="name"
            placeholder="e.g., Technical Skills, Cognitive Abilities"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.name.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {createDomain.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createDomain.error.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            What happens next?
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Domain will be available for creating categories</li>
            <li>• You can add skills and competencies under categories</li>
            <li>• Domain will appear in the skills hierarchy tree</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Domain"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}