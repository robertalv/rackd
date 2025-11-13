import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/players")({
  component: PlayersLayout,
});

function PlayersLayout() {
  return <Outlet />;
}
