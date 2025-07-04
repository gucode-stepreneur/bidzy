import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

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