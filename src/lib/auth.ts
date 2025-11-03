import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text", placeholder: "081234567890" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.phone || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone as string },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (!session) {
          return {
            user: {
              id: "",
              name: "",
              email: null,
              emailVerified: null,
              phone: "",
              role: "CUSTOMER" as UserRole,
            } as any,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }

        if (!session.user) {
          session.user = {
            id: "",
            name: "",
            email: null,
            emailVerified: null,
            phone: "",
            role: "CUSTOMER" as UserRole,
          } as any;
        }

        if (token) {
          if (token.id) session.user.id = String(token.id);
          if (token.phone) session.user.phone = String(token.phone);
          if (token.role) session.user.role = token.role as UserRole;
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        // Return minimal valid session to prevent crash
        return {
          user: {
            id: token?.id as string || "",
            name: "",
            email: null,
            emailVerified: null,
            phone: token?.phone as string || "",
            role: (token?.role as UserRole) || "CUSTOMER",
          } as any,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

