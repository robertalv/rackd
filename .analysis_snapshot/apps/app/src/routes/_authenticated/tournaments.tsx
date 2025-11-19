import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tournaments")({
  component: TournamentsLayout,
});

function TournamentsLayout() {
  return <Outlet />;
}

