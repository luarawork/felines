-- Prevents a user from being linked as a caretaker of the same colony
-- more than once. Without this, clicking "Tornar-se cuidador" twice (or
-- a network retry) silently creates duplicate rows.
alter table caretakers
  add constraint caretakers_colony_user_unique unique (colony_id, user_id);
