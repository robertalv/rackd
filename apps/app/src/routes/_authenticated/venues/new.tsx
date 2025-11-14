"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@rackd/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { AddVenueModal } from "@/components/venues/add-venue-modal";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/venues/new")({
  component: NewVenuePage,
});

function NewVenuePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(true);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Add New Venue</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to create a venue
          </p>
          <Button variant="outline" onClick={() => navigate({ to: "/venues" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const handleVenueAdded = (venueId: string) => {
    navigate({ to: "/venues/$id", params: { id: venueId } });
  };

  const handleCancel = () => {
    navigate({ to: "/venues" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venues
        </Button>
        <h1 className="text-2xl font-bold">Add New Venue</h1>
      </div>

      <AddVenueModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            handleCancel();
          }
        }}
        onVenueAdded={handleVenueAdded}
      />
    </div>
  );
}


