import * as React from "react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'tournament_invite'
  | 'tournament_start'
  | 'match_ready'
  | 'match_result'
  | 'report';

export interface NotificationConfig {
  icon: React.ReactNode;
  bgColor: string;
  getMessage: (notification: any) => string;
  getLink?: (notification: any) => string;
  getContext?: (notification: any) => string | null;
}

export interface NotificationHandlers {
  handleMarkAsRead: (notificationId: Id<"notifications">) => Promise<void>;
}