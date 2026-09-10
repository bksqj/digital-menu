"use server";

import { createHash, randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESET_REQUESTS_PER_HOUR = 3;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) redirect("/forgot-password?error=invalid");

  // Always land on the same "check your email" screen whether or not the
  // account exists — otherwise this endpoint becomes a way to test which
  // emails are registered.
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (user) {
    const recentRequests = await db.passwordResetToken.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });

    if (recentRequests < MAX_RESET_REQUESTS_PER_HOUR) {
      const token = randomBytes(32).toString("hex");
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      if (process.env.NODE_ENV !== "production") {
        // No inbox to check in local dev — the link itself isn't sensitive
        // enough to withhold from your own terminal.
        console.log("[dev] password reset link:", resetUrl);
      }
      await sendEmail({
        to: user.email,
        subject: "Восстановление пароля — Digital Menu",
        html: `
          <p>Кто-то (надеемся, что вы) запросил восстановление пароля для аккаунта на Digital Menu.</p>
          <p><a href="${resetUrl}">Придумать новый пароль</a></p>
          <p>Ссылка действует 1 час. Если это были не вы — просто проигнорируйте это письмо.</p>
        `,
      });
    }
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/reset-password?error=invalid");

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() <= Date.now()) {
    redirect(`/reset-password?token=${parsed.data.token}&error=expired`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  try {
    await signIn("credentials", {
      email: resetToken.user.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
}
