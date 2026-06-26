// Shown instead of (or before) blocking an unauthenticated visitor from
// an action that requires an account — registering a colony, linking as
// caretaker, logging a feeding. Explains why an account helps, instead
// of silently redirecting to /login.
import Link from "next/link";

export default function AuthRequiredNotice() {
  return (
    <div className="rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
      <p>
        Pra fazer isso, você precisa de uma conta. É rápido — e ajuda quem cuida da colônia a
        saber com quem falar.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/signup"
          className="inline-block rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="inline-block rounded-full px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:text-felines-text-primary"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
