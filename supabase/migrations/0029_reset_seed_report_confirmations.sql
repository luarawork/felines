-- Follow-up to 0028: the confirmation rows were deleted, but the
-- denormalized `confirmations` counter on the two seed reports was
-- left stale. Resets it to match reality (zero, since this is fresh
-- demo data).
update reports set confirmations = 0
where id in (
  '8af53238-9e6b-4e62-92e2-72f07cd96532',
  '4859913a-7390-4bf1-ba38-25b008444e9b'
);
