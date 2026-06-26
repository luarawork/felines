// Shown after an anonymous report is submitted successfully. Without an
// account there's no way for the reporter to track what happens to their
// own report afterward, so this nudges them toward signing up right when
// they've just shown they care about a specific case.
import Link from "next/link";

export default function CreateAccountInvite() {
  return (
    <p className="mt-2 text-xs text-felines-text-secondary">
      Quer acompanhar esse relato depois?{" "}
      <Link href="/signup" className="font-medium text-felines-accent-hover">
        Crie uma conta
      </Link>{" "}
      — é rápido e não é obrigatório.
    </p>
  );
}
