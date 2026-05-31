"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "APPOINTMENT_CREATED":
      return <Calendar className="h-4 w-4 text-primary" />;
    case "APPOINTMENT_UPDATED":
      return <Clock className="h-4 w-4 text-amber-600" />;
    case "APPOINTMENT_CANCELED":
      return <Calendar className="h-4 w-4 text-red-500" />;
    case "PAYMENT_COMPLETED":
      return <CreditCard className="h-4 w-4 text-green-600" />;
    case "PRESCRIPTION_CREATED":
      return <FileText className="h-4 w-4 text-blue-600" />;
    case "REVIEW_CREATED":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "SCHEDULE_UPDATED":
      return <Clock className="h-4 w-4 text-purple-600" />;
    case "SYSTEM_ANNOUNCEMENT":
      return <CheckCircle className="h-4 w-4 text-purple-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, isConnected, markAllAsRead } =
    useSocket();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {/* Connection status indicator */}
          <span
            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Read all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">
                {isConnected
                  ? "You'll see real-time updates here"
                  : "Connecting..."}
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <DropdownMenuItem
                key={`${notification.timestamp}-${index}`}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm font-medium text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
