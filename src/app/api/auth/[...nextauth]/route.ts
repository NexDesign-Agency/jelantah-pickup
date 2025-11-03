import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// NextAuth v5 beta returns handlers in handler.handlers.GET/POST
export const GET = handler.handlers.GET;
export const POST = handler.handlers.POST;

