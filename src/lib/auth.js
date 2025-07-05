import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        // Store the Facebook user ID
        if (account.provider === "facebook") {
          token.facebookId = account.providerAccountId;
          
          // บันทึกข้อมูลลง database ทันที
          try {
            await prisma.user.upsert({
              where: { fbId: account.providerAccountId },
              update: { 
                name: profile.name 
              },
              create: {
                name: profile.name,
                fbId: account.providerAccountId
              }
            });
            console.log("User saved to database:", profile.name);
          } catch (error) {
            console.error("Error saving user to database:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      session.facebookId = token.facebookId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/",
    error: "/error",
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "production",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions); 