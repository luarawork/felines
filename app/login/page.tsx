// /login route for Felines.
// Renders the LoginForm client component, which handles Supabase email/
// password authentication.
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">Que bom te ver de novo</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">Entra com seu e-mail e senha.</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
