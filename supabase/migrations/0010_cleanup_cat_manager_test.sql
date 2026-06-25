-- Removes the test caretaker link created while validating the cat
-- management feature (the test cat itself was already deleted via the API).
delete from caretakers where user_id = '2e4c8a83-79f4-4430-9154-154d037aac24';
