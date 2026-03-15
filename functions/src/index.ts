import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const onTaskAssignment = onDocumentUpdated("tasks/{taskId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const newData = snapshot.after.data();
  const previousData = snapshot.before.data();

  if (!newData || !previousData) return;

  // Check if a new user was added to the assignedUsers array
  const newUsers = newData.assignedUsers || [];
  const oldUsers = previousData.assignedUsers || [];

  if (newUsers.length > oldUsers.length) {
    const newUserId = newUsers[newUsers.length - 1];

    // Fetch user token from the 'users' collection
    const userDoc = await admin.firestore().collection("users").doc(newUserId).get();
    const token = userDoc.data()?.fcmToken;

    if (token) {
      const message = {
        notification: {
          title: "New Task Match! 🚀",
          body: `You've been assigned to: ${newData.title}`,
        },
        token: token,
      };

      try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully to:", newUserId);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  }
});