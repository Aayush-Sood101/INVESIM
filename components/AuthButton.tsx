"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    }

    checkUser();

    const unsubscribe = Hub.listen("auth", (data) => {
      if (data.payload.event === "signedIn" || data.payload.event === "signedOut") {
        checkUser();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await signInWithRedirect({
      provider: "COGNITO",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div style={{ padding: "10px" }}>
      {user ? (
        <>
          <span style={{ marginRight: "10px" }}>Welcome, {user.username}</span>
          <button onClick={handleSignOut}>Logout</button>
        </>
      ) : (
        <button onClick={handleSignIn}>Login</button>
      )}
    </div>
  );
}
