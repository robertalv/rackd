"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { ArrowLeft, Edit, MapPin, Phone, Mail, Globe, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditVenueForm } from "@/components/venues/edit-venue-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@rackd/ui/components/alert-dialog";

export const Route = createFileRoute("/_authenticated/venues/$id")({
  component: VenueDetailPage,
});

function VenueDetailPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const { id } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const venue = useQuery(api.venues.getById, { id: id as Id<"venues"> });
  const deleteVenue = useMutation(api.venues.remove);

  const canEdit = venue && currentUser && venue.organizerId === currentUser._id;

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <Button variant="outline" onClick={() => navigate({ to: "/venues" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteVenue({ id: id as Id<"venues"> });
      navigate({ to: "/venues" });
    } catch (error) {
      console.error("Failed to delete venue:", error);
    }
  };

  const handleVenueUpdated = () => {
    setIsEditing(false);
  };

  if (isEditing && canEdit) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Edit
          </Button>
          <h1 className="text-2xl font-bold">Edit Venue: {venue.name}</h1>
        </div>

        <EditVenueForm
          venue={venue}
          onVenueUpdated={handleVenueUpdated}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const getTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'private': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'membership_needed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/venues" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venues
        </Button>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Venue Image */}
        {venue.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Venue Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{venue.name}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {getTypeDisplay(venue.type)}
                  </Badge>
                  <Badge className={getAccessColor(venue.access)}>
                    {venue.access.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {venue.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{venue.description}</p>
              </div>
            )}

            {venue.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">{venue.address}</p>
                </div>
              </div>
            )}

            {venue.operatingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Operating Hours</h3>
                  <p className="text-muted-foreground">{venue.operatingHours}</p>
                </div>
              </div>
            )}

            {(venue.phone || venue.email || venue.website) && (
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="flex flex-wrap gap-4">
                  {venue.phone && (
                    <a
                      href={`tel:${venue.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {venue.phone}
                    </a>
                  )}
                  {venue.email && (
                    <a
                      href={`mailto:${venue.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {venue.email}
                    </a>
                  )}
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {venue.socialLinks && venue.socialLinks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Social Links</h3>
                <div className="flex flex-wrap gap-4">
                  {venue.socialLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the venue "{venue.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

