"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import Link from "next/link";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  navItems: NavItem[];
}

export function Navbar({ navItems }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Jelantah Pickup</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm text-muted-foreground">
          {session?.user?.name || "User"}
        </span>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-4 mt-8">
              <div className="text-sm font-medium">{session?.user?.name}</div>
              <Separator />
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                  >
                    {item.icon && <span className="mr-3 flex items-center">{item.icon}</span>}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Button variant="ghost" onClick={handleLogout} className="text-sm">
          Logout
        </Button>
      </div>
    </nav>
  );
}

