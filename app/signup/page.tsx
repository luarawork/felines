// /signup route for Felines.
// Renders the SignupForm client component, which handles Supabase
// email/password account creation.
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">Criar conta</h1>
      <SignupForm />
    </div>
  );
}
