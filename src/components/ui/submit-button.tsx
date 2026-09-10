"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Disables + relabels itself while its form is submitting. Prevents the
 * classic double-click-on-a-slow-request race — e.g. someone impatient with
 * a cold serverless function clicking "Register" twice, and getting an
 * "email already exists" error from their own first request.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
