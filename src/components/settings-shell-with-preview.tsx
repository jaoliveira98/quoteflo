"use client";

import { useState, useMemo } from "react";
import {
  DashboardShell,
  UserPreviewContext,
  type UserPreviewOverrides,
} from "@/components/dashboard-shell";
import type { UserProfile } from "@/types";

type SettingsShellWithPreviewProps = {
  profile: UserProfile;
  hasAccess: boolean;
  children: React.ReactNode;
};

export function SettingsShellWithPreview({
  profile,
  hasAccess,
  children,
}: SettingsShellWithPreviewProps) {
  const [preview, setPreview] = useState<UserPreviewOverrides>({});

  const effectiveUser = useMemo(
    () => ({
      email: preview.email ?? profile.business_email ?? profile.email,
      company_name: preview.company_name ?? profile.company_name ?? "",
      brand_color: preview.brand_color ?? profile.brand_color,
    }),
    [
      profile.email,
      profile.business_email,
      profile.company_name,
      profile.brand_color,
      preview.email,
      preview.company_name,
      preview.brand_color,
    ]
  );

  return (
    <UserPreviewContext.Provider value={{ preview, setPreview }}>
      <DashboardShell user={effectiveUser} hasAccess={hasAccess}>
        {children}
      </DashboardShell>
    </UserPreviewContext.Provider>
  );
}
