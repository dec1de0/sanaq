"use client";
import { useCallback } from "react";
import { unlockPro, isConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

const PRO_PASSWORD = "1234";

export function usePro(profile: Profile | null, refreshProfile: () => void) {
  const isPro = profile?.is_pro ?? false;

  const tryUnlock = useCallback(
    async (password: string, userId: string): Promise<boolean> => {
      if (password !== PRO_PASSWORD) return false;
      if (!isConfigured) return false;
      await unlockPro(userId);
      refreshProfile();
      return true;
    },
    [refreshProfile]
  );

  return { isPro, tryUnlock };
}
