import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import { ipURL } from "./backendURL";
import { axiosWithAuth } from "./customAxios";

const PUSH_TOKEN_KEY = "expo_push_token";
const TOKEN_SENT_KEY = "push_token_sent";

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    // Check if we already have a stored token
    const storedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (storedToken) {
      console.log("Using cached push token:", storedToken);
      return storedToken;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      // Store the token locally
      await SecureStore.setItemAsync(PUSH_TOKEN_KEY, pushTokenString);
      console.log("New push token generated and cached:", pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}

export async function sendPushTokenToBackend(token: string) {
  try {
    // Check if we've already sent this token
    const tokenSent = await SecureStore.getItemAsync(TOKEN_SENT_KEY);
    if (tokenSent === token) {
      console.log("Push token already sent to backend, skipping...");
      return;
    }

    // Get auth token to identify the user
    const authTokenData = await SecureStore.getItemAsync("authToken");
    if (!authTokenData) {
      console.log("No auth token found, skipping push token send");
      return;
    }

    const authToken = JSON.parse(authTokenData)?.token;
    if (!authToken || authToken === "gues_login") {
      console.log("Invalid auth token, skipping push token send");
      return;
    }

    // Send token to backend
    const response = await axiosWithAuth.post(`${ipURL}/api/auth/register-push-token`, { pushToken: token });

    if (response.status === 200) {
      // Mark this token as sent
      await SecureStore.setItemAsync(TOKEN_SENT_KEY, token);
      console.log("Push token successfully sent to backend");
    }
  } catch (error) {
    console.error("Error sending push token to backend:", error);
    // Don't throw error to avoid breaking the app flow
  }
}

export async function clearPushTokenCache() {
  try {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_SENT_KEY);
    console.log("Push token cache cleared");
  } catch (error) {
    console.error("Error clearing push token cache:", error);
  }
}