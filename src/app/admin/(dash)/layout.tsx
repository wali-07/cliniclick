import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminLogout } from "@/components/admin/admin-logout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <span className="text-base font-semibold tracking-[-0.02em] text-navy-900">
              Clini<span className="text-purple-600">Click</span>
              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                Admin
              </span>
            </span>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 font-medium text-ink-600 transition hover:bg-purple-50 hover:text-navy-900"
              >
                SEO content
              </Link>
              <Link
                href="/admin/social"
                className="rounded-full px-3 py-1.5 font-medium text-ink-600 transition hover:bg-purple-50 hover:text-navy-900"
              >
                Social
              </Link>
            </nav>
          </div>
          <AdminLogout />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
