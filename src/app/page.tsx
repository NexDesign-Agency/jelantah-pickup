import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Jelantah Pickup
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

