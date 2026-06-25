// /profile route for Felines.
// Requires authentication. Renders the ProfileContent client component,
// which loads the signed-in user's contribution history, linked colonies,
// and knowledge progress.
import ProfileContent from "@/components/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">Seu perfil</h1>
      <ProfileContent />
    </div>
  );
}
