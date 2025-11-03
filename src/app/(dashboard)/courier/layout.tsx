import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Package, History } from "lucide-react";

const createIcon = (Icon: typeof Package) => <Icon className="h-4 w-4" />;

const courierNavItems = [
  { title: "Active Orders", href: "/courier", icon: createIcon(Package) },
  { title: "History", href: "/courier/history", icon: createIcon(History) },
];

export default async function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "COURIER") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={courierNavItems} />
      <Sidebar navItems={courierNavItems} />
      <main className="md:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

