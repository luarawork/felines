# Felines

Plataforma comunitária que mapeia colônias de gatos de rua em Natal, RN, e ajuda vizinhos a entenderem e cuidarem dos gatos da sua região. Projeto construído para o hackathon Hack the Kitty.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Leaflet/react-leaflet, Supabase (banco + auth + storage), deploy no Netlify.

## Setup local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env.local` na raiz com:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_WEATHER_API_KEY=...
   ```
3. No SQL Editor do Supabase, rode todos os arquivos de `supabase/migrations/` em ordem numérica (0001, 0002, 0003...). Cada um é independente e idempotente o suficiente para rodar uma vez só, na ordem certa. Destaques:
   - `0001_init.sql` — tabelas e RLS
   - `0002_colony_photos.sql` — coluna de foto de capa + bucket de storage
   - `0003_seed_demo_data.sql` — dados de exemplo (opcional, útil para demo)
   - `0009_delete_policies.sql` — políticas de delete (faltavam no schema inicial)
   - Os demais arquivos numerados são correções, RPCs (confirmação de relato, localização exata) e limpezas de dados de teste feitas durante o desenvolvimento.
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000).

## Páginas

- `/` — home educacional
- `/map` — mapa interativo de colônias, avistamentos e emergências
- `/colony/[id]` — detalhe de uma colônia
- `/colony/new` — cadastro de colônia (requer login)
- `/help` — fluxo de orientação/emergência
- `/learn` e `/learn/[slug]` — guia educacional com progresso e quiz
- `/login`, `/signup`, `/profile` — autenticação e perfil do usuário
- `/reports` — confirmar e resolver relatos (requer login)

## Funcionalidades extras

- Banner de clima (OpenWeatherMap) com alertas de calor extremo/chuva forte em `/map` e `/colony/[id]`
- Gerenciamento de gatos da colônia (adicionar, marcar castrado, remover) para criador/cuidadores
- Carta para o próximo cuidador em cada colônia
