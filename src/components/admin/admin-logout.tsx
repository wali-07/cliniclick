"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-navy-900 transition hover:border-navy-900"
    >
      Sign out
    </button>
  );
}
