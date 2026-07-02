// Shared helpers for uploading user photos to Supabase Storage.
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validatePhotoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "O arquivo precisa ser uma imagem.";
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
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
  const randomToken = Math.random().toString(36).slice(2, 10);
  return `${safePrefix}/${Date.now()}-${randomToken}.${extension}`;
}
