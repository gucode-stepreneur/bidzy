"use client";
import { signIn } from "next-auth/react";

export default function FacebookLoginButton() {
  return (
    <button onClick={() => signIn("facebook")}>
      Sign in with Facebook
    </button>
  );
}