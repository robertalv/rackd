export type TournamentStatus = "all" | "upcoming" | "active" | "completed" | "draft";

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getGameTypeLabel(gameType: string): string {
  switch (gameType) {
    case "eight_ball":
      return "8-Ball";
    case "nine_ball":
      return "9-Ball";
    case "ten_ball":
      return "10-Ball";
    case "one_pocket":
      return "One Pocket";
    case "bank_pool":
      return "Bank Pool";
    default:
      return gameType;
  }
}

export function getGameTypeImage(gameType: string): { imageSrc: string; alt: string } {
  // For now, return placeholder. You can add actual images later
  const images: Record<string, { imageSrc: string; alt: string }> = {
    eight_ball: {
      imageSrc: "/images/8ball.png",
      alt: "8-Ball",
    },
    nine_ball: {
      imageSrc: "/images/9ball.png",
      alt: "9-Ball",
    },
    ten_ball: {
      imageSrc: "/images/10ball.png",
      alt: "10-Ball",
    },
    one_pocket: {
      imageSrc: "/images/chalk.png",
      alt: "One Pocket",
    },
    bank_pool: {
      imageSrc: "/images/chalk.png",
      alt: "Bank Pool",
    },
  };

  return images[gameType] || { imageSrc: "/logo.png", alt: gameType };
}

export function getStatusBadgeProps(status: TournamentStatus): { variant: "default" | "secondary" | "destructive" | "outline"; text: string } {
  switch (status) {
    case "upcoming":
      return { variant: "default", text: "Upcoming" };
    case "active":
      return { variant: "default", text: "In Progress" };
    case "completed":
      return { variant: "secondary", text: "Completed" };
    case "draft":
      return { variant: "outline", text: "Draft" };
    default:
      return { variant: "secondary", text: status };
  }
}




