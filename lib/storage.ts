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
export function buildSafeStoragePath(prefix: string, file: File): string {
  const extensionMatch = file.name.match(/\.([a-zA-Z0-9]{1,5})$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
  const randomToken = Math.random().toString(36).slice(2, 10);
  return `${prefix}/${Date.now()}-${randomToken}.${extension}`;
}
