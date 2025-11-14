"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/providers/ThemeProvider";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { useState, useMemo } from "react";
import { EditVenueForm } from "@/components/venues/edit-venue-form";
import { TournamentPageCard } from "@/components/tournaments/tournament-page-card";
import { Icon, ChampionIcon, StoreLocation01Icon, InformationCircleIcon, Add01Icon, Location03Icon, ArrowLeft01Icon, Edit01Icon, Delete03Icon, Time04Icon, CallIcon, EarthIcon, Mail01Icon } from "@rackd/ui/icons";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@rackd/ui/components/tabs";
import { PageHeader } from "@/components/layout/page-header";
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
  const { resolvedTheme } = useTheme();
  const { id } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tournamentViewMode, setTournamentViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("overview");

  const venue = useQuery(api.venues.getById, { id: id as Id<"venues"> });
  const tournaments = useQuery(api.venues.getTournamentsByVenue, { venueId: id as Id<"venues"> });
  const tables = useQuery(api.venues.getTablesByVenue, { venueId: id as Id<"venues"> });
  const deleteVenue = useMutation(api.venues.remove);

  const canEdit = venue && currentUser && venue.organizerId === currentUser._id;

  // Group tournaments by status
  const tournamentsByStatus = useMemo(() => {
    if (!tournaments) return { upcoming: [], active: [], completed: [], draft: [] };

    const grouped = {
      upcoming: [] as any[],
      active: [] as any[],
      completed: [] as any[],
      draft: [] as any[],
    };

    tournaments.forEach((tournament: any) => {
      const status = tournament.status || "upcoming";
      if (status in grouped) {
        grouped[status as keyof typeof grouped].push(tournament);
      }
    });

    // Sort upcoming by date (soonest first), completed by date (most recent first)
    grouped.upcoming.sort((a, b) => a.date - b.date);
    grouped.active.sort((a, b) => a.date - b.date);
    grouped.completed.sort((a, b) => b.date - a.date);
    grouped.draft.sort((a, b) => b.date - a.date);

    return grouped;
  }, [tournaments]);

  // Group tables by manufacturer and size
  const tablesByType = useMemo(() => {
    if (!tables || tables.length === 0) return {};
    
    const grouped: Record<string, any[]> = {};
    tables.forEach((table: any) => {
      const key = `${table.manufacturer}-${table.size}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(table);
    });
    
    return grouped;
  }, [tables]);

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <Button variant="outline" onClick={() => navigate({ to: "/venues" })}>
            <Icon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
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
            <Icon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
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
      case 'public': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Public' };
      case 'private': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Private' };
      case 'membership_needed': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Membership Required' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const accessBadge = getAccessColor(venue.access);
  const location = [venue.city, venue.region, venue.country].filter(Boolean).join(", ");
  const totalTournaments = tournaments?.length || 0;
  const upcomingCount = tournamentsByStatus.upcoming.length;
  const activeCount = tournamentsByStatus.active.length;
  const completedCount = tournamentsByStatus.completed.length;
  const totalTables = tables?.length || 0;

  const actionButton = canEdit ? (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        <Icon icon={Edit01Icon} className="h-4 w-4" />
        Edit
      </Button>
      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
        <Icon icon={Delete03Icon} className="h-4 w-4" />
        Delete
      </Button>
    </div>
  ) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={venue.name}
        description={venue.address}
        actionButton={actionButton}
        viewMode={activeTab === "tournaments" ? tournamentViewMode : undefined}
        onViewModeChange={activeTab === "tournaments" ? setTournamentViewMode : undefined}
        sticky={false}
        onBack={() => navigate({ to: "/venues" })}
        backLabel="Back to Venues"
        showSearch={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {/* Venue Info Badges */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <Badge className={`${accessBadge.bg} ${accessBadge.text}`}>
            {accessBadge.label}
          </Badge>
          <Badge variant="outline">
            {getTypeDisplay(venue.type)}
          </Badge>
          {location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon icon={StoreLocation01Icon} className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Venue Image */}
            {venue.imageUrl && (
              <div className="aspect-[21/9] w-full rounded-lg overflow-hidden bg-muted mb-8">
                <img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={InformationCircleIcon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Overview</HeaderLabel>
                </TabsTrigger>
                <TabsTrigger 
                  value="tournaments"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Tournaments</HeaderLabel>
                  {totalTournaments > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {totalTournaments}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="location"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={Location03Icon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Location</HeaderLabel>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {venue.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About the space</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Key Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {venue.address && (
                      <div className="flex items-start gap-3">
                        <Icon icon={Location03Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">Address</h3>
                          <p className="text-muted-foreground">{venue.address}</p>
                        </div>
                      </div>
                    )}

                    {venue.operatingHours && (
                      <div className="flex items-start gap-3">
                        <Icon icon={Time04Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">Operating Hours</h3>
                          <p className="text-muted-foreground">{venue.operatingHours}</p>
                        </div>
                      </div>
                    )}

                    {(venue.phone || venue.email || venue.website) && (
                      <div>
                        <h3 className="font-semibold mb-3">Contact Information</h3>
                        <div className="space-y-2">
                          {venue.phone && (
                            <a
                              href={`tel:${venue.phone}`}
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Icon icon={CallIcon} className="h-4 w-4" />
                              {venue.phone}
                            </a>
                          )}
                          {venue.email && (
                            <a
                              href={`mailto:${venue.email}`}
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Icon icon={Mail01Icon} className="h-4 w-4" />
                              {venue.email}
                            </a>
                          )}
                          {venue.website && (
                            <a
                              href={venue.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Icon icon={EarthIcon} className="h-4 w-4" />
                              Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {venue.socialLinks && venue.socialLinks.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Social Links</h3>
                        <div className="flex flex-wrap gap-3">
                          {venue.socialLinks.map((link: any, index: number) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {link.platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tournaments Tab */}
              <TabsContent value="tournaments" className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {upcomingCount > 0 && <span className="text-foreground font-medium">{upcomingCount}</span>} {upcomingCount === 1 ? 'Upcoming' : 'Upcoming'}
                    {activeCount > 0 && (
                      <>
                        {" • "}
                        <span className="text-foreground font-medium">{activeCount}</span> {activeCount === 1 ? 'Active' : 'Active'}
                      </>
                    )}
                    {completedCount > 0 && (
                      <>
                        {" • "}
                        <span className="text-foreground font-medium">{completedCount}</span> {completedCount === 1 ? 'Past' : 'Past'}
                      </>
                    )}
                  </div>
                </div>

                {/* Upcoming Tournaments */}
                {tournamentsByStatus.upcoming.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Upcoming Tournaments</h3>
                    <div className={tournamentViewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                      : "space-y-3"
                    }>
                      {tournamentsByStatus.upcoming.map((tournament: any) => (
                        <TournamentPageCard
                          key={tournament._id}
                          tournament={{
                            _id: tournament._id,
                            name: tournament.name,
                            date: tournament.date,
                            gameType: tournament.gameType || "eight_ball",
                            type: tournament.type || "single",
                            status: tournament.status || "upcoming",
                            flyerUrl: tournament.flyerUrl,
                            venue: tournament.venue || {
                              name: venue.name,
                              city: venue.city,
                              region: venue.region,
                              country: venue.country,
                            },
                            entryFee: tournament.entryFee,
                            registeredCount: tournament.registeredCount,
                            maxPlayers: tournament.maxPlayers,
                            organizerName: tournament.organizerName || "Unknown",
                          }}
                          viewMode={tournamentViewMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Tournaments */}
                {tournamentsByStatus.active.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Active Tournaments</h3>
                    <div className={tournamentViewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                      : "space-y-3"
                    }>
                      {tournamentsByStatus.active.map((tournament: any) => (
                        <TournamentPageCard
                          key={tournament._id}
                          tournament={{
                            _id: tournament._id,
                            name: tournament.name,
                            date: tournament.date,
                            gameType: tournament.gameType || "eight_ball",
                            type: tournament.type || "single",
                            status: tournament.status || "active",
                            flyerUrl: tournament.flyerUrl,
                            venue: tournament.venue || {
                              name: venue.name,
                              city: venue.city,
                              region: venue.region,
                              country: venue.country,
                            },
                            entryFee: tournament.entryFee,
                            registeredCount: tournament.registeredCount,
                            maxPlayers: tournament.maxPlayers,
                            organizerName: tournament.organizerName || "Unknown",
                          }}
                          viewMode={tournamentViewMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Tournaments */}
                {tournamentsByStatus.completed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Past Tournaments</h3>
                    <div className={tournamentViewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                      : "space-y-3"
                    }>
                      {tournamentsByStatus.completed.map((tournament: any) => (
                        <TournamentPageCard
                          key={tournament._id}
                          tournament={{
                            _id: tournament._id,
                            name: tournament.name,
                            date: tournament.date,
                            gameType: tournament.gameType || "eight_ball",
                            type: tournament.type || "single",
                            status: tournament.status || "completed",
                            flyerUrl: tournament.flyerUrl,
                            venue: tournament.venue || {
                              name: venue.name,
                              city: venue.city,
                              region: venue.region,
                              country: venue.country,
                            },
                            entryFee: tournament.entryFee,
                            registeredCount: tournament.registeredCount,
                            maxPlayers: tournament.maxPlayers,
                            organizerName: tournament.organizerName || "Unknown",
                          }}
                          viewMode={tournamentViewMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Tournaments */}
                {tournaments && 
                 tournamentsByStatus.upcoming.length === 0 && 
                 tournamentsByStatus.active.length === 0 && 
                 tournamentsByStatus.completed.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
                        <p className="text-muted-foreground">
                          This venue doesn't have any tournaments scheduled yet.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {venue.address || location ? (
                      <div className="space-y-4">
                        {venue.address && (
                          <div className="flex items-start gap-3">
                            <Icon icon={Location03Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <h3 className="font-semibold mb-1">Address</h3>
                              <p className="text-muted-foreground">{venue.address}</p>
                              {location && (
                                <p className="text-sm text-muted-foreground mt-1">{location}</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ 
                              border: 0,
                              filter: resolvedTheme === "dark" ? "invert(0.92) hue-rotate(180deg) brightness(0.85) contrast(1.1)" : "none"
                            }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCMATXv8JTcYrllKHglpuvYdiwrR0o99eE&q=${encodeURIComponent(
                              venue.coordinates 
                                ? `${venue.coordinates.lat},${venue.coordinates.lng}`
                                : venue.address 
                                  ? `${venue.address}, ${location}`
                                  : location || ''
                            )}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mapsUrl = venue.coordinates
                                ? `https://www.google.com/maps?q=${venue.coordinates.lat},${venue.coordinates.lng}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    venue.address 
                                      ? `${venue.address}, ${location}`
                                      : location || ''
                                  )}`;
                              window.open(mapsUrl, '_blank');
                            }}
                          >
                            <Icon icon={Location03Icon} className="h-4 w-4 mr-2" />
                            Open in Google Maps
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Icon icon={Location03Icon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No location information</h3>
                        <p className="text-muted-foreground">
                          This venue doesn't have address or location information available.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Tables</span>
                    <span className="font-semibold text-foreground">{totalTables}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Tournaments</span>
                    <span className="font-semibold text-foreground">{totalTournaments}</span>
                  </div>
                  {upcomingCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Upcoming</span>
                      <span className="font-semibold text-foreground">{upcomingCount}</span>
                    </div>
                  )}
                  {activeCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span className="font-semibold text-foreground">{activeCount}</span>
                    </div>
                  )}
                  {completedCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Past</span>
                      <span className="font-semibold text-foreground">{completedCount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Card */}
              {(venue.phone || venue.email || venue.website) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {venue.phone && (
                      <a
                        href={`tel:${venue.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon icon={CallIcon} className="h-4 w-4" />
                        {venue.phone}
                      </a>
                    )}
                    {venue.email && (
                      <a
                        href={`mailto:${venue.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon icon={Mail01Icon} className="h-4 w-4" />
                        {venue.email}
                      </a>
                    )}
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon icon={EarthIcon} className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tables Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tables</CardTitle>
                    {canEdit && (
                      <Button variant="outline" size="sm">
                        <Icon icon={Add01Icon} className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tables === undefined ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Loading tables...</p>
                    </div>
                  ) : totalTables === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Icon icon={StoreLocation01Icon} className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">No tables found</p>
                      <p className="text-xs text-muted-foreground">for this venue</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(tablesByType).map(([key, tableGroup]) => {
                        const firstTable = tableGroup[0];
                        const tableNumbers = tableGroup.map((t: any) => t.tableNumber || t.startNumber).sort((a, b) => a - b);
                        const statusCounts = tableGroup.reduce((acc: any, t: any) => {
                          const status = t.status || "OPEN";
                          acc[status] = (acc[status] || 0) + 1;
                          return acc;
                        }, {});

                        return (
                          <div key={key} className="border-b border-border pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm text-foreground">{firstTable.manufacturer}</p>
                                <p className="text-xs text-muted-foreground">{firstTable.size}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {tableGroup.length} {tableGroup.length === 1 ? 'table' : 'tables'}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Tables:</span>
                                <span className="text-foreground font-medium">
                                  {tableNumbers.length <= 5 
                                    ? tableNumbers.join(", ")
                                    : `${tableNumbers.slice(0, 3).join(", ")}... (+${tableNumbers.length - 3} more)`
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Card */}
              {location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <Icon icon={StoreLocation01Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        {venue.address && (
                          <p className="text-sm text-foreground mb-1">{venue.address}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
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


