"use client";

import * as React from "react";
import { Bell, Heart, MessageCircle, UserPlus, Trophy, Hash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@rackd/ui/components/dropdown-menu";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { api } from "@rackd/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@rackd/ui/components/tabs";
import { cn } from "@rackd/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { NavigationButton } from "./navigation-button";

// Define all possible notification types from your schema
type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'tournament_invite'
  | 'tournament_start'
  | 'match_ready'
  | 'match_result';

// Configuration for each notification type
interface NotificationConfig {
  icon: React.ReactNode;
  bgColor: string;
  getMessage: (notification: any) => string;
  getLink?: (notification: any) => string;
}

interface NotificationHandlers {
  handleMarkAsRead: (notificationId: Id<"notifications">) => Promise<void>;
}

// Configuration for all notification types
const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  follow: {
    icon: <UserPlus className="h-4 w-4 text-white" />,
    bgColor: "bg-blue-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} started following you`,
    getLink: (notification) => `/${notification.actor?.username}`
  },
  like: {
    icon: <Heart className="h-4 w-4 text-white" />,
    bgColor: "bg-red-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} liked your post`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  comment: {
    icon: <MessageCircle className="h-4 w-4 text-white" />,
    bgColor: "bg-green-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} commented on your post`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  mention: {
    icon: <Hash className="h-4 w-4 text-white" />,
    bgColor: "bg-purple-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} mentioned you`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  tournament_invite: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-yellow-500",
    getMessage: (notification) => 
      `You've been invited to ${notification.tournament?.name || 'a tournament'}`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`
  },
  tournament_start: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-orange-500",
    getMessage: (notification) => 
      `${notification.tournament?.name || 'Tournament'} is starting soon`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`
  },
  match_ready: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-indigo-500",
    getMessage: (notification) => 
      `Your match is ready to begin`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`
  },
  match_result: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-emerald-500",
    getMessage: (notification) => 
      `Match result has been posted`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`
  }
};

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const config = notificationConfigs[type];
  if (!config) return null;

  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
      {config.icon}
    </div>
  );
};

const NotificationContent = ({ 
  notification, 
  handlers 
}: { 
  notification: any;
  handlers: NotificationHandlers;
}) => {
  const config = notificationConfigs[notification.type as NotificationType];
  if (!config) return null;

  const message = config.getMessage(notification);
  const link = config.getLink?.(notification);

  const handleClick = async () => {
    if (!notification.read) {
      await handlers.handleMarkAsRead(notification._id);
    }
  };

  const content = (
    <div className="flex-1">
      <div className="flex items-start justify-between mb-1">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            {notification.actor && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={notification.actor?.image} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {notification.actor?.displayName?.charAt(0).toUpperCase() || 
                   notification.actor?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <p className={cn(
              "text-sm",
              !notification.read ? "font-medium" : "font-normal"
            )}>
              {message}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">
          {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
        </span>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-1/2 -translate-y-1/2" />
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {content}
    </div>
  );
};

export function NotificationsDropdown() {
  const notifications = useQuery(api.notifications.getByUser, { limit: 20 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const notificationHandlers: NotificationHandlers = {
    handleMarkAsRead
  };

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const readNotifications = notifications?.filter(n => n.read) || [];

  const renderNotification = (notification: any) => (
    <div 
      key={notification._id} 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 relative",
        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <NotificationIcon type={notification.type as NotificationType} />
      <NotificationContent 
        notification={notification}
        handlers={notificationHandlers}
      />
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavigationButton
          icon={Bell}
          count={unreadCount || 0}
          ariaLabel="Notifications"
          badgePosition="top-right"
          tooltip={
            unreadCount && unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'No new notifications'
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[450px] h-[500px] relative top-2 left-2.5" 
        align="end" 
        side="bottom"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="unread" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All
                {notifications && notifications.length > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="overflow-y-auto max-h-[380px]">
            <TabsContent value="unread" className="space-y-1 p-2 mt-2">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                unreadNotifications.map(renderNotification)
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-1 p-2 mt-2">
              {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(renderNotification)
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="outline" asChild className="w-full">
            <Link to="/notifications">
              View All Notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}