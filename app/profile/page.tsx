// /profile route for Felines.
// Requires authentication. Renders the ProfileContent client component,
// which owns its own full-bleed sections (header, colonies, activity,
// knowledge) in the same editorial style as the home page.
import ProfileContent from "@/components/ProfileContent";

export default function ProfilePage() {
  return <ProfileContent />;
}
