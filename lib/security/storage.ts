// Shared helpers for uploading user photos to Supabase Storage.
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Explicit allowlist rather than a broad "image/*" check — that would
// also accept image/svg+xml, which can embed a <script> tag and isn't a
// raster image at all. Matches the extension allowlist in
// buildSafeStoragePath below, so a file can't pass validation with one
// MIME type and land in storage with a different, unvalidated extension.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "O arquivo precisa ser uma imagem (JPG, PNG, WebP ou GIF).";
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "A imagem precisa ter no máximo 5MB.";
  }
  return null;
}

// Builds a safe storage path from a user-picked file. The original
// filename is never used directly in the path — untrusted input there
// could contain path-traversal sequences ("../") or characters that
// break the URL, so only the extension is kept, sanitized to a short
// alphanumeric token.
//
// The prefix (a colony/user id used to group photos into a folder) is
// sanitized too, not just the filename — it's normally a Supabase
// UUID, but every call site builds it by string-interpolating a route
// param or id (e.g. `stories/${colonyId}`), so this is defense in
// depth against a "../" or absolute-path segment ever reaching
// Storage, instead of trusting each call site to have validated it.
export function buildSafeStoragePath(prefix: string, file: File): string {
  const safePrefix = prefix
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9\-_/]/g, "_")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
  const extensionMatch = file.name.match(/\.([a-zA-Z0-9]{1,5})$/);
  const candidateExtension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
  const extension = ALLOWED_EXTENSIONS.includes(candidateExtension) ? candidateExtension : "jpg";
  const randomToken = Math.random().toString(36).slice(2, 10);
  return `${safePrefix}/${Date.now()}-${randomToken}.${extension}`;
}

// A path built by buildSafeStoragePath can never actually contain
// ".." — this is a belt-and-suspenders assertion called right at each
// upload call site (not just buried in the builder) so it's visible
// wherever the path reaches Supabase Storage, per Aikido Security.
export function assertSafeStoragePath(filePath: string): void {
  if (filePath.includes("..") || filePath.startsWith("/")) {
    throw new Error("Invalid file path");
  }
}
