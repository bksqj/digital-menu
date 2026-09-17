"use server";

import { randomBytes, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { updateProfileNameSchema } from "@/lib/validation/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESET_REQUESTS_PER_HOUR = 3;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function updateProfileNameAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = updateProfileNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) redirect("/dashboard/profile?error=invalid_name");

  await db.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile?saved=1");
}

// Reuses the exact same reset-link pipeline as the public "forgot password"
// flow (requestPasswordResetAction in actions/auth.ts) — no separate
// change-password form here, so there's no second place to keep a password
// policy or rate limit in sync with.
export async function requestOwnPasswordResetAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/login");

  const recentRequests = await db.passwordResetToken.count({
    where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });

  if (recentRequests < MAX_RESET_REQUESTS_PER_HOUR) {
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        userId: session.user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("[dev] password reset link:", resetUrl);
    }
    await sendEmail({
      to: session.user.email,
      subject: "Смена пароля — Digital Menu",
      html: `
        <p>Вы запросили смену пароля для аккаунта на Digital Menu.</p>
        <p><a href="${resetUrl}">Придумать новый пароль</a></p>
        <p>Ссылка действует 1 час. Если это были не вы — просто проигнорируйте это письмо.</p>
      `,
    });
  }

  redirect("/dashboard/profile?reset_sent=1");
}
