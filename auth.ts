import { createUser, getUserByEmail, updateUserProfile } from "@/actions/users";
import NextAuth, {
  getServerSession,
  type Account,
  type NextAuthOptions,
  type Profile,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

      async profile(tokens, profile) {
        // console.log("tokens in google provider", tokens)
        // console.log("profile in google provider", profile)
        // console.log("profile in google provider", profile)
        // get the user details
        const email = tokens.email;
        let existingUser = await getUserByEmail(email);
        // console.log("found user", existingUser)
        if (!existingUser) {
          console.log(
            "User does not exist, creating new user in google provider profile"
          );
          // User does not exist, create new user
          const defaultPasswordHash = ""; // Replace with a secure hash generation logic
          existingUser = await createUser({
            email: email,
            username: "",
            passwordHash: defaultPasswordHash,
          });
        }
        return {
          id: tokens.sub || "",
          customUser: existingUser,
          ...tokens,
          ...profile,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
  },
  callbacks: {
    async signIn({
      account,
      profile,
    }: {
      account: Account | null;
      profile?: Profile | any;
    }) {
      // console.log("in signIn callback");
      // console.log("account in signIn callback", account);
      // console.log("profile in signIn callback", profile);
      if (
        account &&
        (account.provider === "google" || account.provider === "zoho") &&
        profile &&
        profile.email
      ) {
        if (process.env.ALLOWED_EMAILS === "ANY") {
          console.warn("Any email is allowed, skipping email check");
        }
        const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
        if (
          profile &&
          profile.email &&
          allowedEmails[0] !== "ANY" &&
          !allowedEmails.includes(profile.email)
        ) {
          console.log("User email not allowed:", profile.email);
          return false;
        }
        const email = profile?.email;
        let existingUser = await getUserByEmail(email);

        if (existingUser) {
          await updateUserProfile(email, {
            username: profile.name || "",
          });
        }

        if (!existingUser) {
          // User does not exist, create new user
          console.log(
            "User does not exist, creating new user in  signIn callback"
          );
          const defaultPasswordHash = ""; // Replace with a secure hash generation logic
          existingUser = await createUser({
            email: email,
            username: profile?.name || "",
            passwordHash: defaultPasswordHash,
          });
        }
        // Attach the serialized user object to the session or handle appropriately
        console.log("User authenticated:", {
          ...existingUser,
          created_at: existingUser.created_at.toISOString(),
          updated_at: existingUser.updated_at.toISOString(),
        });
      }
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      // console.log("in session callback");
      // console.log("session in session: ", session);
      // console.log("token in session : ", token);

      session.user.customUser = token.customUser; // Ensure the custom user is passed from the token to the session
      session.user.image = token.picture; // Map image field
      session.user.provider = token.provider; // Map provider field
      session.expires = token.expires_at;

      // console.log("Final session : ", session);
      return session;
    },
    async jwt({
      token,
      user,
    }: {
      token: any;
      profile?: any;
      user: any;
      account?: Account | null;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }) {
      // console.log("in jwt callback");
      // console.log("token in jwt", token);
      // console.log("user in jwt", user);

      if (user) {
        token.image = user.image; // Map image field
        token.provider = user.provider; // Map provider field
      }
      return { ...token, ...user };
    },
  },
};
export default NextAuth(authOptions);

export const getSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};
