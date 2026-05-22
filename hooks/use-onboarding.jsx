"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexQuery, useConvexMutation } from "./use-convex-query";
import { api } from "@/lib/api";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser
  );

  const { mutate: skipOnboarding } = useConvexMutation(
    api.users.skipOnboarding
  );

  useEffect(() => {
    if (isLoading || !currentUser) return;

    // Only show on the homepage and only if onboarding hasn't been completed
    if (!currentUser.hasCompletedOnboarding && pathname === "/") {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [currentUser, pathname, isLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  };

  const handleOnboardingSkip = async () => {
    setShowOnboarding(false);
    try {
      // Mark as done in DB so it NEVER shows again
      await skipOnboarding({});
    } catch (e) {
      console.error("Failed to skip onboarding:", e);
    }
  };

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding: currentUser && !currentUser.hasCompletedOnboarding,
  };
}
