"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=credentials");
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/register?error=invalid");
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    redirect("/register?error=exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({
    data: { email: parsed.data.email, passwordHash, name: parsed.data.name },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created but auto-login failed for some reason —
      // send them to log in manually rather than losing the new account.
      redirect("/login");
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
