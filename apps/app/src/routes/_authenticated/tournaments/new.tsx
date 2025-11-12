"use client";

import { createFileRoute } from "@tanstack/react-router";
import { TournamentForm } from "@/components/tournaments/tournament-form";

export const Route = createFileRoute("/_authenticated/tournaments/new")({
  component: NewTournamentPage,
});

function NewTournamentPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <TournamentForm />
    </div>
  );
}

