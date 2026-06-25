-- Cleans up real (non-mine) test activity accumulated while testing
-- features in the browser: a caretaker link, a feeding, report
-- confirmations, test reports, and a test display name. Runs as
-- superuser in the SQL Editor, so it isn't blocked by the RLS policies
-- that would normally stop these deletes via the API (no delete policy
-- exists for report_confirmations, and the test account's credentials
-- aren't available here anyway).

delete from report_confirmations where report_id in (
  'e352fa1b-e210-4fed-b2c0-f0f7e2d95f8e', -- "teste mapa"
  '8af53238-9e6b-4e62-92e2-72f07cd96532', -- seed sighting (confirmation was test activity, report itself stays)
  '4859913a-7390-4bf1-ba38-25b008444e9b'  -- seed injured_sick (same)
);

delete from reports where id in (
  'd7c14096-49e0-4017-a791-a7c58802422c', -- "Rua Mermoz" full address test
  '7c265fca-de3e-4393-9323-8df3e628ea7f', -- "Rua Mermoz, 150" test
  '6f8f3b7a-64b3-4908-9e9a-5d4193a4a33f', -- "Rua dos Paianazes" test
  'e352fa1b-e210-4fed-b2c0-f0f7e2d95f8e'  -- "teste mapa"
);

delete from feedings where id = '3e2c4ca4-c829-4826-bcac-fa76d9e70cc1';

delete from timeline_events where event_type = 'new_caretaker'
  and colony_id = 'e0593a01-bc87-4d2b-8697-a0be1fc367c0';

delete from caretakers where colony_id = 'e0593a01-bc87-4d2b-8697-a0be1fc367c0'
  and user_id = '2222cfba-db71-4573-8368-6840c3baadb5';

update profiles set display_name = null
  where id = '2222cfba-db71-4573-8368-6840c3baadb5';
