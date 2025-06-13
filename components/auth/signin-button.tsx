"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
      Sign In with Google
    </button>
  );
}
