// /login route for Felines.
// Renders the LoginForm client component, which handles Supabase email/
// password authentication.
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">Entrar</h1>
      <LoginForm />
    </div>
  );
}
