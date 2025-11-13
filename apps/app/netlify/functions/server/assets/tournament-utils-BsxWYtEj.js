function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function getGameTypeLabel(gameType) {
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
function getGameTypeImage(gameType) {
  const images = {
    eight_ball: {
      imageSrc: "/images/8ball.png",
      alt: "8-Ball"
    },
    nine_ball: {
      imageSrc: "/images/9ball.png",
      alt: "9-Ball"
    },
    ten_ball: {
      imageSrc: "/images/10ball.png",
      alt: "10-Ball"
    },
    one_pocket: {
      imageSrc: "/images/chalk.png",
      alt: "One Pocket"
    },
    bank_pool: {
      imageSrc: "/images/chalk.png",
      alt: "Bank Pool"
    }
  };
  return images[gameType] || { imageSrc: "/logo.png", alt: gameType };
}
function getStatusBadgeProps(status) {
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
export {
  getStatusBadgeProps as a,
  getGameTypeLabel as b,
  formatDate as f,
  getGameTypeImage as g
};
