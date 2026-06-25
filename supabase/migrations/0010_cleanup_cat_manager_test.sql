-- Removes the test caretaker link created while validating the cat
-- management feature (the test cat itself was already deleted via the API).
delete from caretakers where user_id = '2e4c8a83-79f4-4430-9154-154d037aac24';

-- Removes the test report created while validating the confirm/resolve
-- flow. It has created_by = null (submitted anonymously), so it couldn't
-- be deleted via the API (reports_delete_own only allows the creator).
delete from reports where id = '95412aa0-43dc-4470-ba18-805b72027bac';
