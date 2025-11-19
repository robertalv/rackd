"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rackd/ui/components/table";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Card, CardContent } from "@rackd/ui/components/card";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Trophy, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";

interface DiscoverTournamentsTableProps {
  searchQuery: string;
  filters: {
    location: string;
    followers: string;
    engagement: string;
    category: string;
  };
}

export function DiscoverTournamentsTable({ searchQuery, filters }: DiscoverTournamentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tournaments = useQuery(api.tournaments.getAllTournaments, {});

  if (tournaments === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Loading tournaments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tournaments available</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create a tournament for the community
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter tournaments based on search and filters
  const filteredTournaments = tournaments.filter((tournament: any) => {
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.category && filters.category !== "all" && tournament.status !== filters.category) {
      return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-green-100 text-green-800 border-green-200";
      case "active": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "draft": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return "Upcoming";
      case "active": return "In Progress";
      case "completed": return "Completed";
      case "draft": return "Draft";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "single": return "Single Elimination";
      case "double": return "Double Elimination";
      case "scotch_double": return "Scotch Double";
      case "teams": return "Teams";
      case "round_robin": return "Round Robin";
      default: return type;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Tournament</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Entry Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTournaments.map((tournament: any) => (
                <TableRow key={tournament._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Link 
                        to="/tournaments/$id" 
                        params={{ id: tournament._id }}
                      >
                        <p className="font-medium hover:text-primary">{tournament.name}</p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(tournament.type)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{new Date(tournament.date).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{tournament.venue?.name || tournament.venue || "TBD"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {tournament.registeredCount || 0}
                        {tournament.maxPlayers && `/${tournament.maxPlayers}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {tournament.entryFee ? `$${tournament.entryFee}` : "Free"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tournament.status)}>
                      {getStatusLabel(tournament.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {tournament.status === "upcoming" && (
                        <Button size="sm" variant="default">
                          Register
                        </Button>
                      )}
                      <Link 
                        to="/tournaments/$id" 
                        params={{ id: tournament._id }}
                      >
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTournaments.length)} of {filteredTournaments.length} tournaments
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

