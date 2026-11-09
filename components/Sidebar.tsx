import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/receipts", label: "Receipts", icon: "🧾" },
  { href: "/transactions", label: "Transactions", icon: "💳" },
  { href: "/categories", label: "Categories", icon: "📂" },
  { href: "/reports", label: "Reports", icon: "📊" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border p-4 hidden sm:block">
      <div className="font-semibold text-lg mb-6 px-2">🪙 Receipt Accountant</div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-panel hover:text-white transition"
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
