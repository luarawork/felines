// /signup route for Felines.
// Renders the SignupForm client component, which handles Supabase
// email/password account creation.
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">Vamos começar</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">
        Leva menos de um minuto pra criar sua conta.
      </p>
      <SignupForm />
    </div>
  );
}
