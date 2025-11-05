"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import { amplifyConfig } from "../aws-exports";

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        Amplify.configure(amplifyConfig);
        console.log("✅ Amplify configured successfully");
      } catch (err) {
        console.error("Amplify configuration error:", err);
      }
    }
  }, []);

  return <>{children}</>;
}
