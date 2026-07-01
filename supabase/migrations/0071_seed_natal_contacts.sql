-- Seeds community_contacts with a starter set of real Natal/RN contacts
-- so the /contacts page isn't empty on a fresh deploy. created_by is
-- left null (curated/seed data, not tied to a specific user) — this is
-- allowed by the schema (0061) since created_by has no NOT NULL
-- constraint, and this INSERT runs with elevated privilege in the SQL
-- editor, so the authenticated-only RLS insert policy doesn't apply
-- here (RLS only gates client requests through PostgREST).
--
-- Each row is guarded with `where not exists` on (city, name) so this
-- migration is safe to run more than once without creating duplicates.

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Hospital Veterinário Anclivepa (24h)', '0800 727 7966', 'sac@redehospvetanclivepa.com.br', null, 'vet',
  'Av. Presidente Bandeira, 339 – Alecrim. Particular ($). 24h, atende animais silvestres e emergências.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Hospital Veterinário Anclivepa (24h)');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Hospital Veterinário de Natal', '(84) 2030-2003/3234-1671', null, '@hospitalveterinario_natal', 'vet',
  'Av. Xavier da Silveira, 876 – Lagoa Nova (Unidade I). Duas unidades, particular ($), atendimento 24h.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Hospital Veterinário de Natal');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Hospital Amigo Bicho (24h)', '(84) 3611-2223', null, '@hospitalamigobicho', 'vet',
  'Av. Xavier da Silveira, 1620 – Lagoa Nova. Particular ($), 24h, farmácia e todas as especialidades.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Hospital Amigo Bicho (24h)');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'IRV — Instituto de Radiologia Veterinária', '(84) 3207-1064/98899-1064', 'irvnatalcontato@gmail.com', null, 'vet',
  'Av. Ayrton Senna, 389, Loja 38. Particular ($). Diagnóstico por imagem. Atende a domicílio para raio-x.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'IRV — Instituto de Radiologia Veterinária');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'ASPAN — Associação de Proteção aos Animais', '(84) 99108-9750', 'siteaspan@gmail.com', '@aspan.rn · aspan-rn.org', 'ngo',
  'Maior ONG de Natal, ativa desde 1998. Abrigo com ~480 animais. Parceria com a DEPREMA. Feiras de adoção e mutirões de castração. PIX/CNPJ: 03.399.956/0001-04'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'ASPAN — Associação de Proteção aos Animais');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Instituto Hope RN', '(84) 9108-2063', 'contato@institutohopern.org', '@institutohopern · institutohopern.org', 'ngo',
  'Rua Francisco Aires de Carvalho, 109 – Monte Belo. ONG fundada por mulheres nordestinas, utilidade pública estadual (Lei 10.928/2021). Abrigo com ~60 animais. Apoia 5 protetoras em Natal, Parnamirim e São Gonçalo.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Instituto Hope RN');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Patamada ONG', '(84) 3618-1624/99840-8120', null, '@patamadaong', 'ngo',
  'Abrigo no Planalto, ~200 animais. Recebe denúncias e resgata animais abandonados, atropelados e envenenados. PIX/CNPJ: 12.273.307/0001'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Patamada ONG');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'DEPREMA — Delegacia Especializada em Proteção ao Meio Ambiente', '(84) 3232-7404', null, null, 'legal',
  'Av. Engenheiro Roberto Freire, 8790 – Ponta Negra (Praia Shopping). Crimes ambientais e maus-tratos. Parceira da ASPAN. Aceita denúncia anônima com fotos/vídeos.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'DEPREMA — Delegacia Especializada em Proteção ao Meio Ambiente');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'SEMURB — Secretaria Municipal de Meio Ambiente e Urbanismo', '(84) 3616-9829', 'ouvidoria.semurb@natal.rn.gov.br', null, 'general',
  'Ouvidoria recebe denúncias de maus-tratos. Seg. a sex., 8h–16h. Fora do horário: ligue 190 ou 181.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'SEMURB — Secretaria Municipal de Meio Ambiente e Urbanismo');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'CCZ — Centro de Controle de Zoonoses de Natal', null, null, null, 'general',
  'Av. Fronteiras, 1526 – N. Sra. da Apresentação, CEP 59129-200. Castração gratuita, vacinação antirrábica, controle de zoonoses. Acionar em surto de doença ou suspeita de raiva.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'CCZ — Centro de Controle de Zoonoses de Natal');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Disque Denúncia — Polícia Civil', '181', null, null, 'legal',
  'Anônimo, disponível 24h. Denúncias de maus-tratos, abandono e crimes ambientais.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Disque Denúncia — Polícia Civil');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'CIOSP — Emergência', '190', null, null, 'legal',
  'Para emergência real em andamento — flagrante de maus-tratos, envenenamento em curso.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'CIOSP — Emergência');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'IBAMA — Linha Verde', '0800 618 080', null, null, 'legal',
  'Tráfico de animais silvestres, comercialização ilegal e crimes ambientais federais.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'IBAMA — Linha Verde');

insert into community_contacts (city, name, phone, email, social, category, notes)
select 'Natal', 'Batalhão de Policiamento Ambiental (BPAmb)', '(84) 3201-5353', 'parquedasdunas@digi.com.br', null, 'legal',
  'Polícia Militar Ambiental do RN. Atua em crimes ambientais em conjunto com a DEPREMA.'
where not exists (select 1 from community_contacts where city = 'Natal' and name = 'Batalhão de Policiamento Ambiental (BPAmb)');
