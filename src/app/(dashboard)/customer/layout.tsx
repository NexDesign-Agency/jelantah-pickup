import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-export";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LayoutDashboard, Package, Users, PlusCircle } from "lucide-react";

const createIcon = (Icon: typeof LayoutDashboard) => <Icon className="h-4 w-4" />;

const customerNavItems = [
  { title: "Dashboard", href: "/customer", icon: createIcon(LayoutDashboard) },
  { title: "Request Pickup", href: "/customer/request-pickup", icon: createIcon(PlusCircle) },
  { title: "My Orders", href: "/customer/orders", icon: createIcon(Package) },
  { title: "Referrals", href: "/customer/referrals", icon: createIcon(Users) },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={customerNavItems} />
      <Sidebar navItems={customerNavItems} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

