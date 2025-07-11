import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
  } from "react";
  import * as Notifications from "expo-notifications";

  import { registerForPushNotificationsAsync, sendPushTokenToBackend } from "@/utils/registerForPushNotificationsAsync";
import { router } from "expo-router";
  
  interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
  }
  
  const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
  );
  
  export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
      throw new Error(
        "useNotification must be used within a NotificationProvider"
      );
    }
    return context;
  };
  
  interface NotificationProviderProps {
    children: ReactNode;
  }
  
  export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
  }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
      useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);
  
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();
  
    useEffect(() => {
      registerForPushNotificationsAsync().then(
        (token) => {
          setExpoPushToken(token);
          // Send token to backend (this will handle the "send once" logic internally)
          sendPushTokenToBackend(token);
        },
        (error) => setError(error)
      );
  
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
         
          console.log("🔔 Notification Received: ", notification);
          setNotification(notification);
        });
  
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          //Write logic to handle after notification is clicked
          const notificationData = response.notification.request.content.data;
          
          if (notificationData.type === "bedtime_reminder") {
            router.replace('/(tabs)/library');
          } 
          console.log(
            "🔔 Notification Response: ",
            JSON.stringify(response, null, 2),
            JSON.stringify(response.notification.request.content.data, null, 2)
          );
          // Handle the notification response here
        });
  
      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }, []);
  
    return (
      <NotificationContext.Provider
        value={{ expoPushToken, notification, error }}
      >
        {children}
      </NotificationContext.Provider>
    );
  };