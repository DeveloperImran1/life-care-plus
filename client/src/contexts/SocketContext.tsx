"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getNotifications, markAllNotificationsAsRead as apiMarkAllAsRead } from "@/app/(dashboard)/_services/notification.service";

interface NotificationData {
  id?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: string;
  actionUrl?: string;
  timestamp: string;
  isRead?: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  clearNotification: (index: number) => void;
  clearAllNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  clearNotification: () => {},
  clearAllNotifications: () => {},
  markAllAsRead: async () => {},
});

function getAccessTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("accessToken=")
  );
  if (!tokenCookie) return null;
  return tokenCookie.trim().split("=").slice(1).join("=");
}

interface SocketProviderProps {
  children: React.ReactNode;
  token?: string | null;
}

export function SocketProvider({ children, token: propToken }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const clearNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    
    // Call server action to update DB
    try {
      await apiMarkAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read in DB", error);
    }
  }, []);

  // Fetch initial notifications from DB
  const fetchInitialNotifications = useCallback(async () => {
    try {
      const response = await getNotifications({ limit: 50 });
      if (response && response.success && Array.isArray(response.data)) {
        // Map database fields to context state format
        const formatted = response.data.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          message: item.message,
          data: item.data,
          priority: item.priority,
          actionUrl: item.actionUrl,
          timestamp: item.createdAt,
          isRead: item.isRead,
        }));
        setNotifications(formatted);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  }, []);

  useEffect(() => {
    // Prefer token passed from server layout, fallback to cookie
    const token = propToken || getAccessTokenFromCookie();

    if (!token) {
      console.log("⚠️ No authentication token found for socket connection");
      return;
    }

    // Fetch history
    fetchInitialNotifications();

    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    // If running in browser and URL contains 'backend', replace it with current host
    if (typeof window !== "undefined") {
      const isDockerBackend = socketUrl.includes("backend");
      if (isDockerBackend) {
        socketUrl = socketUrl.replace("backend", window.location.hostname);
        // Replace ws:// with http:// or wss:// with https:// if socket.io needs it,
        // but socket.io-client supports both ws and http schemes directly.
      }
    }

    console.log("Connecting socket to:", socketUrl);

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setIsConnected(false);
    });

    socketInstance.on("notification", (data: NotificationData) => {
      console.log("📬 New notification:", data);

      // Add to state
      setNotifications((prev) => [{ ...data, isRead: false }, ...prev]);

      // Show toast notification
      const toastType =
        data.priority === "HIGH"
          ? "warning"
          : data.priority === "LOW"
            ? "info"
            : "success";

      if (toastType === "warning") {
        toast.warning(data.title, {
          description: data.message,
          duration: 5000,
        });
      } else if (toastType === "info") {
        toast.info(data.title, {
          description: data.message,
          duration: 4000,
        });
      } else {
        toast.success(data.title, {
          description: data.message,
          duration: 4000,
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [propToken, fetchInitialNotifications]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        clearNotification,
        clearAllNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
