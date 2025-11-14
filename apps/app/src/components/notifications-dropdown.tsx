"use client";

import { Heart, MessageCircle, UserPlus, Trophy, Hash } from "lucide-react";
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
import { NavigationButton } from "./navigation-button";
import { Icon, Notification01Icon, TickDouble01Icon, Flag03Icon } from "@rackd/ui/icons";
import type { NotificationType, NotificationConfig, NotificationHandlers } from "@rackd/types";
import { HeaderLabel } from "@rackd/ui/components/label";
import { ProfileAvatar } from "./profile-avatar";

const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  follow: {
    icon: <UserPlus className="h-4 w-4 text-white" />,
    bgColor: "bg-blue-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} started following you`,
    getLink: (notification) => `/${notification.actor?.username}`,
    getContext: () => null
  },
  like: {
    icon: <Heart className="h-4 w-4 text-white" />,
    bgColor: "bg-red-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} liked your post`,
    getLink: (notification) => `/post/${notification.postId}`,
    getContext: (notification) => notification.post?.content?.substring(0, 30) || null
  },
  comment: {
    icon: <MessageCircle className="h-4 w-4 text-white" />,
    bgColor: "bg-green-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} commented on your post`,
    getLink: (notification) => `/post/${notification.postId}`,
    getContext: (notification) => notification.post?.content?.substring(0, 30) || null
  },
  mention: {
    icon: <Hash className="h-4 w-4 text-white" />,
    bgColor: "bg-purple-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} mentioned you`,
    getLink: (notification) => `/post/${notification.postId}`,
    getContext: (notification) => notification.post?.content?.substring(0, 30) || null
  },
  tournament_invite: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-yellow-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} joined to ${notification.tournament?.name || 'a tournament'}`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`,
    getContext: (notification) => notification.tournament?.name || null
  },
  tournament_start: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-orange-500",
    getMessage: (notification) => 
      `${notification.tournament?.name || 'Tournament'} is starting soon`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`,
    getContext: (notification) => notification.tournament?.name || null
  },
  match_ready: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-indigo-500",
    getMessage: (_notification) => 
      `Your match is ready to begin`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`,
    getContext: (notification) => notification.tournament?.name || null
  },
  match_result: {
    icon: <Trophy className="h-4 w-4 text-white" />,
    bgColor: "bg-emerald-500",
    getMessage: (_notification) => 
      `Match result has been posted`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`,
    getContext: (notification) => notification.tournament?.name || null
  },
  report: {
    icon: <Icon icon={Flag03Icon} className="h-4 w-4 text-white" />,
    bgColor: "bg-orange-500",
    getMessage: (notification) => 
      `${notification.actor?.displayName || notification.actor?.name || 'Someone'} reported your post`,
    getLink: (notification) => `/post/${notification.postId}`,
    getContext: (notification) => notification.post?.content?.substring(0, 30) || null
  }
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
  const context = config.getContext?.(notification);
  const timeAgo = formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true });

  const handleClick = async () => {
    if (!notification.read) {
      await handlers.handleMarkAsRead(notification._id);
    }
  };

  const actorName = notification.actor?.displayName || notification.actor?.name || 'Someone';
  const actorInitials = actorName.charAt(0).toUpperCase();
  const actorImage = notification.actor?.image;

  const content = (
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm leading-snug",
            !notification.read ? "font-semibold text-foreground" : "font-normal text-foreground/90"
          )}>
            {message}
          </p>
          {context && (
            <p className="text-xs text-muted-foreground">
              {context}
            </p>
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <div className="flex items-start gap-2 shrink-0">
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );

  const wrapperClass = cn(
    "flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors rounded-xl",
    !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
  );

  if (link) {
    return (
      <Link to={link} onClick={handleClick} className={wrapperClass}>
        {notification.actor && (
          <ProfileAvatar
            user={{
              displayName: notification.actor?.displayName || notification.actor?.name || 'Someone',
              image: notification.actor?.image || undefined,
              country: notification.actor?.country || undefined,
            }}
            size="sm"
          />
        )}
        {content}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className={cn(wrapperClass, "cursor-pointer")}>
      {notification.actor && (
        <ProfileAvatar
          user={{
            displayName: notification.actor?.displayName || notification.actor?.name || 'Someone',
            image: notification.actor?.image || undefined,
            country: notification.actor?.country || undefined,
          }}
          size="sm"
        />
      )}
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

  const displayUnreadCount = 
    unreadCount !== undefined && unreadCount !== null && unreadCount >= 0
      ? unreadCount 
      : unreadNotifications.length;

  const renderNotification = (notification: any) => (
    <NotificationContent 
      key={notification._id}
      notification={notification}
      handlers={notificationHandlers}
    />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavigationButton
          icon={Notification01Icon}
          count={displayUnreadCount > 0 ? displayUnreadCount : undefined}
          ariaLabel="Notifications"
          badgePosition="top-right"
          tooltip={
            displayUnreadCount > 0
              ? `${displayUnreadCount} unread notification${displayUnreadCount === 1 ? '' : 's'}`
              : 'No new notifications'
          }
          tooltipPosition="bottom"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[450px] h-[500px] relative top-3 right-3" 
        align="start" 
        side="bottom"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <HeaderLabel size="xl">Notifications</HeaderLabel>
          {unreadNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <Icon icon={TickDouble01Icon} className="h-4 w-4" />
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
                  <Badge variant="secondary" className="text-xs">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="overflow-y-auto max-h-[380px]">
            <TabsContent value="unread" className="space-y-1 p-2 mt-2">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon icon={Notification01Icon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                unreadNotifications.map(renderNotification)
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-1 p-2 mt-2">
              {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon icon={Notification01Icon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(renderNotification)
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        {/* TODO: Add notifications page route */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="outline" asChild className="w-full">
            <Link to="/notifications">
              View All Notifications
            </Link>
          </Button>
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}