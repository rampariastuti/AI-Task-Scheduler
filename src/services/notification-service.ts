"use client";

import { getToken, isSupported } from "firebase/messaging";
import { messaging, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const useNotifications = (userId: string) => {
  const requestPermission = async () => {
    try {
      // 1. Check if browser supports messaging (Essential for Chrome/Safari compatibility)
      const supported = await isSupported();
      if (!supported || !messaging) {
        console.warn("Push notifications are not supported in this browser.");
        return;
      }

      // 2. Request permission from the user
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });

        if (token) {
          // 3. Save to Firestore
          await updateDoc(doc(db, "users", userId), {
            fcmToken: token,
          });
          console.log("FCM Token registered successfully.");
        }
      }
    } catch (error) {
      console.error("Failed to register for notifications:", error);
    }
  };

  return { requestPermission };
};