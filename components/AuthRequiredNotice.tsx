// Shown instead of (or before) blocking an unauthenticated visitor from
// an action that requires an account — registering a colony, linking as
// caretaker, logging a feeding. Explains why an account helps, instead
// of silently redirecting to /login.
import Link from "next/link";

export default function AuthRequiredNotice() {
  return (
    <div className="rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
      <p>
        Para fazer isso, você precisa de uma conta rápida — isso ajuda a comunidade saber com
        quem entrar em contato.
      </p>
      <Link
        href="/signup"
        className="mt-2 inline-block rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
      >
        Criar conta
      </Link>
    </div>
  );
}
