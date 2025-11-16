"use client";

import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useForm } from "react-hook-form";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@rackd/ui/components/dialog";
import { Label } from "@rackd/ui/components/label";
import { toast } from "sonner";

type TemplateFormData = {
  name: string;
};

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentData: any; // Tournament form data to save as template
}

export function SaveTemplateModal({ open, onOpenChange, tournamentData }: SaveTemplateModalProps) {
  // Note: tournamentTemplates.create mutation may need to be created
  // For now, we'll show a message that this feature is coming soon
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<TemplateFormData>();

  const onSubmit = async (data: TemplateFormData) => {
    try {
      // TODO: Implement tournamentTemplates.create mutation
      // const templateData = {
      //   name: data.name,
      //   type: tournamentData.type,
      //   playerType: tournamentData.playerType,
      //   gameType: tournamentData.gameType,
      //   bracketOrdering: tournamentData.bracketOrdering,
      //   winnersRaceTo: tournamentData.winnersRaceTo,
      //   losersRaceTo: tournamentData.losersRaceTo,
      //   maxPlayers: tournamentData.maxPlayers,
      //   entryFee: tournamentData.entryFee,
      //   venueId: tournamentData.venueId,
      //   description: tournamentData.description,
      // };
      // await create(templateData);
      
      toast.info("Template saving feature coming soon!");
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save Tournament Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">
              Template Name *
            </Label>
            <Input
              {...register("name", { required: true })}
              placeholder="e.g. Weekly 9-Ball Tournament"
              autoFocus
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-2">This template will save:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Game format and type</li>
              <li>• Player configuration</li>
              <li>• Bracket settings</li>
              <li>• Race to settings</li>
              <li>• Entry fee and max players</li>
              <li>• Venue selection</li>
            </ul>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : "Save Template"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}





