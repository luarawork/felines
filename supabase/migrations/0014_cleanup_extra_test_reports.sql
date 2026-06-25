-- Removes leftover reports with no description created while exploring
-- the /help flow during development. Keeps the two seeded demo reports
-- (the injured cat near Av. Engenheiro Roberto Freire and the sighting
-- near Parque das Dunas), which both have a description.
delete from reports
where description is null
  and type in ('new_kitten', 'sighting');
