import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function createNotification(notification: {
  type: "order" | "user" | "inventory" | "payment";
  title: string;
  message: string;
  referenceId?: string;
}) {
  try {
    const notifRef = collection(db, "notifications");
    await addDoc(notifRef, {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function checkAndCreateStockAlert(productId: string, productName: string, stock: number) {
  if (stock > 5) return; // Not low stock

  const isOutOfStock = stock === 0;
  const title = isOutOfStock ? "Out of Stock" : "Low Stock Alert";
  const message = isOutOfStock 
    ? `${productName} is now out of stock.`
    : `${productName} is running low on stock (${stock} left).`;

  try {
    // Check if there is already a notification for this product with this exact message
    const notifRef = collection(db, "notifications");
    const q = query(
      notifRef, 
      where("referenceId", "==", productId),
      where("type", "==", "inventory"),
      where("message", "==", message)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Notification with this exact message/stock count already exists, skip
      return;
    }

    // Create notification
    await addDoc(notifRef, {
      type: "inventory",
      title,
      message,
      referenceId: productId,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error checking/creating stock alert:", error);
  }
}
