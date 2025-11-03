import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-export";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Package, CheckCircle } from "lucide-react";

const createIcon = (Icon: typeof Package) => <Icon className="h-4 w-4" />;

const warehouseNavItems = [
  { title: "Pending Verification", href: "/warehouse", icon: createIcon(Package) },
  { title: "Verified Orders", href: "/warehouse/verified", icon: createIcon(CheckCircle) },
];

export default async function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "WAREHOUSE") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={warehouseNavItems} />
      <Sidebar navItems={warehouseNavItems} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

