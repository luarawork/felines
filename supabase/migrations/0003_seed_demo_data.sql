-- Optional demo data for Felines, useful for showing a populated map
-- during the hackathon demo. Safe to run after 0001 and 0002 — it only
-- inserts rows, it doesn't alter the schema. created_by is left null
-- since these aren't tied to a real authenticated user.

insert into colonies (name, narrative, latitude, longitude, latitude_blurred, longitude_blurred, castration_status)
values
  (
    'Colônia da Praia do Meio',
    'Grupo de gatos que vive perto do calçadão, cuidado por moradores da região há mais de 2 anos.',
    -5.7631, -35.1962, -5.7642, -35.1971,
    'full'
  ),
  (
    'Colônia do Tirol',
    'Gatos avistados com frequência em um terreno baldio na Rua Coronel Estevam.',
    -5.7901, -35.2078, -5.7889, -35.2065,
    'partial'
  ),
  (
    'Colônia de Ponta Negra',
    'Colônia próxima às dunas, ainda sem nenhum gato castrado.',
    -5.8767, -35.1689, -5.8779, -35.1701,
    'none'
  )
on conflict do nothing;

-- A couple of named cats for the first demo colony.
insert into cats (colony_id, name, castrated, last_seen)
select id, 'Mingau', true, now() - interval '2 days'
from colonies where name = 'Colônia da Praia do Meio'
on conflict do nothing;

insert into cats (colony_id, name, castrated, last_seen)
select id, 'Fuligem', true, now() - interval '5 days'
from colonies where name = 'Colônia da Praia do Meio'
on conflict do nothing;

-- One open emergency-type report and one sighting, so the map shows all pin types.
insert into reports (type, description, latitude, longitude, status)
values
  ('injured_sick', 'Gato com a pata machucada perto da Av. Engenheiro Roberto Freire.', -5.8254, -35.1813, 'open'),
  ('sighting', 'Gato avistado caminhando perto do Parque das Dunas.', -5.8089, -35.2034, 'open')
on conflict do nothing;
