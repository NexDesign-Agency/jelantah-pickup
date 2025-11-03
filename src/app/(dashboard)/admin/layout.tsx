import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-export";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LayoutDashboard, Package, Users, CreditCard, Settings, Zap } from "lucide-react";

const createIcon = (Icon: typeof LayoutDashboard) => <Icon className="h-4 w-4" />;

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: createIcon(LayoutDashboard) },
  { title: "Quick Pickup", href: "/admin/quick-pickup", icon: createIcon(Zap) },
  { title: "Orders", href: "/admin/orders", icon: createIcon(Package) },
  { title: "Customers", href: "/admin/customers", icon: createIcon(Users) },
  { title: "Billing", href: "/admin/billing", icon: createIcon(CreditCard) },
  { title: "Settings", href: "/admin/settings", icon: createIcon(Settings) },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={adminNavItems} />
      <Sidebar navItems={adminNavItems} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

