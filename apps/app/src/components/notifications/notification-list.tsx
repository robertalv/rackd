"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { Badge } from "@rackd/ui/components/badge";
import { Bell, BellOff, Heart, MessageCircle, Users, Trophy, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.getByUser, { limit: 50 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow": return <Users className="h-4 w-4 text-blue-500" />;
      case "like": return <Heart className="h-4 w-4 text-red-500" />;
      case "comment": return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "tournament_invite": return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "tournament_start": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "match_ready": return <Trophy className="h-4 w-4 text-orange-500" />;
      case "match_result": return <Trophy className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: any) => {
    const actorName = notification.actor?.displayName || "Someone";
    
    switch (notification.type) {
      case "follow":
        return `${actorName} started following you`;
      case "like":
        return `${actorName} liked your post`;
      case "comment":
        return `${actorName} commented on your post`;
      case "tournament_invite":
        return `${actorName} registered for your tournament`;
      case "tournament_start":
        return `Tournament "${notification.tournament?.name}" is starting`;
      case "match_ready":
        return `Your match is ready to start`;
      case "match_result":
        return `Match result has been posted`;
      default:
        return "New notification";
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "follow":
        return `/${notification.actor?.username}`;
      case "like":
      case "comment":
        return notification.post ? `/posts/${notification.postId}` : "#";
      case "tournament_invite":
      case "tournament_start":
        return notification.tournament ? `/tournaments/${notification.tournamentId}` : "#";
      case "match_ready":
      case "match_result":
        return notification.match ? `/matches/${notification.matchId}` : "#";
      default:
        return "#";
    }
  };

  if (notifications === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Bell className="h-6 w-6 animate-pulse mr-2" />
            <span>Loading notifications...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay up to date with activity from the pool community
          </p>
        </div>
        
        {unreadNotifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <BellOff className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                When you get notifications, they'll appear here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              All Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive">
                  {unreadNotifications.length} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {notifications.map((notification: any) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition-colors ${
                  !notification.read 
                    ? "bg-primary/5 border-primary/20" 
                    : "hover:bg-muted/50"
                }`}
              >
                <Link
                  to={getNotificationLink(notification)}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  className="block"
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Actor Avatar */}
                    {notification.actor && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.actor.image} />
                        <AvatarFallback>
                          {notification.actor.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        {getNotificationText(notification)}
                      </p>
                      
                      {/* Context */}
                      {notification.post && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                          "{notification.post.content.substring(0, 100)}..."
                        </div>
                      )}
                      
                      {notification.tournament && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                          Tournament: {notification.tournament.name}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}