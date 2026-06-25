-- Removes the test data created while validating the signup -> login ->
-- create colony -> caretaker -> feeding -> knowledge progress flow.
-- Safe to run once; uses no service-role-only operations.

delete from knowledge_progress where user_id = 'bfaa81b7-6232-4bcf-86fb-3546aebf1509';
delete from feedings where user_id = 'bfaa81b7-6232-4bcf-86fb-3546aebf1509';
delete from caretakers where user_id = 'bfaa81b7-6232-4bcf-86fb-3546aebf1509';
delete from colonies where id = 'd0de6f28-ffa6-4562-b249-68d873d4b17b';
delete from reports where description like 'teste%' or description like 'Localização informada%teste%';

-- Optional: also remove the test auth user itself via
-- Authentication > Users > teste.felines@exemplo.com > Delete user
-- in the Supabase dashboard (deleting auth users isn't available via SQL/API key).
