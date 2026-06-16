"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  role: "customer" | "admin";
  addresses: Address[];
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginEmail: (e: string, p: string) => Promise<UserProfile>;
  registerEmail: (e: string, p: string, name: string) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  updateAddresses: (addresses: Address[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userRef = useRef<UserProfile | null>(null);

  // Keep ref synchronized with state to avoid closures issues inside useEffect
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Sync user profile from firestore or create one if it doesn't exist
  const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    try {
      const userRefDoc = doc(db, "users", firebaseUser.uid);
      console.log("Current User:", auth.currentUser);
      console.log("Reading collection: users");
      console.log("UID:", firebaseUser.uid);
      const userSnap = await getDoc(userRefDoc);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data || !data.role || (data.role !== "admin" && data.role !== "customer")) {
          console.error("User document is missing a valid role:", data);
          setUser(null);
          await signOut(auth);
          throw new Error("Missing or invalid user role configuration.");
        }
        const profile = data as UserProfile;
        setUser(profile);
        return profile;
      } else {
        // Create user document
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "Valued Customer",
          role: firebaseUser.email === "admin@elanoragems.com" ? "admin" : "customer",
          addresses: [],
          createdAt: new Date().toISOString()
        };
        console.log("Current User:", auth.currentUser);
        console.log("Writing collection: users");
        console.log("UID:", firebaseUser.uid);
        await setDoc(userRefDoc, newProfile);
        if (newProfile.role === "customer") {
          try {
            await createNotification({
              type: "user",
              title: "New User Registration",
              message: `${newProfile.displayName} just created an account.`,
              referenceId: newProfile.email || newProfile.uid
            });
          } catch (notifErr) {
            console.error("Failed to create user registration notification:", notifErr);
          }
        }
        setUser(newProfile);
        return newProfile;
      }
    } catch (error: any) {
      console.error("Error syncing user profile:", error);
      if (error.code === "permission-denied" || error.message?.includes("permissions") || error.message?.includes("permission")) {
        console.warn("Invalid/revoked user session detected. Signing out...");
        try {
          await signOut(auth);
        } catch (signoutError) {
          console.error("Error during recovery signOut:", signoutError);
        }
        setUser(null);
      }
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user profile is already in context state, skip loading and re-sync
        if (userRef.current && userRef.current.uid === firebaseUser.uid) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          await syncUserProfile(firebaseUser);
        } catch (err) {
          console.error("Failed to sync on auth change:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginEmail = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await syncUserProfile(userCredential.user);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const registerEmail = async (email: string, pass: string, name: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      console.log("Creating user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      console.log("User created:", userCredential.user.uid);
      // Write new profile immediately
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        role: email === "admin@elanoragems.com" ? "admin" : "customer",
        addresses: [],
        createdAt: new Date().toISOString()
      };
      console.log("Saving user document...");
      console.log("Current User:", auth.currentUser);
      console.log("Writing collection: users");
      console.log("UID:", userCredential.user.uid);
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      if (newProfile.role === "customer") {
        try {
          await createNotification({
            type: "user",
            title: "New User Registration",
            message: `${newProfile.displayName} just created an account.`,
            referenceId: newProfile.email || newProfile.uid
          });
        } catch (notifErr) {
          console.error("Failed to create user registration notification:", notifErr);
        }
      }
      setUser(newProfile);
      setLoading(false);
      return newProfile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const profile = await syncUserProfile(userCredential.user);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateAddresses = async (addresses: Address[]) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      console.log("Current User:", auth.currentUser);
      console.log("Updating collection: users");
      console.log("UID:", user.uid);
      await updateDoc(userRef, { addresses });
      setUser((prev) => (prev ? { ...prev, addresses } : null));
    } catch (error) {
      console.error("Error updating user addresses:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginEmail,
        registerEmail,
        loginGoogle,
        logout,
        resetPassword,
        updateAddresses
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
