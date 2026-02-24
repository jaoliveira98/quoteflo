import { redirect } from "next/navigation";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.success) qs.set("success", params.success);
  if (params.canceled) qs.set("canceled", params.canceled);
  const q = qs.toString();
  redirect(`/settings/account${q ? `?${q}` : ""}`);
}
