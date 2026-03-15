"use client";

import { getToken } from "firebase/messaging";
import { messaging, db } from "@/lib/firebase"; 
import { doc, updateDoc } from "firebase/firestore";

export const useNotifications = (userId: string) => {
  const requestPermission = async () => {
    // 1. Check if we are in the browser and messaging is initialized
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
        const token = await getToken(messaging, { 
          vapidKey: "YOUR_PUBLIC_VAPID_KEY" // Get this from Firebase Console > Project Settings > Cloud Messaging
        });
        
        if (token) {
          await updateDoc(doc(db, "users", userId), {
            fcmToken: token
          });
          console.log("Token saved!");
        }
      } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
      }
    }
  };

  return { requestPermission };
};