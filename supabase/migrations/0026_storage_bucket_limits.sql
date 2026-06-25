-- Defense in depth: the app already validates photo type/size client-
-- side (lib/storage.ts), but that's trivially bypassable by anyone
-- calling the Storage API directly with a real access token. Enforcing
-- the same limits at the bucket level closes that gap server-side.
update storage.buckets
set file_size_limit = 5242880, -- 5MB, matches the client-side check
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'colony-photos';
