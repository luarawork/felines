// /resources now lives as a tab on /reports — kept as a redirect so
// existing links (nav, colony page, profile) don't break.
import { redirect } from "next/navigation";

export default function ResourcesPage() {
  redirect("/reports?tab=resources");
}
