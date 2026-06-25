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
3. No SQL Editor do Supabase, rode as migrations em ordem:
   - `supabase/migrations/0001_init.sql` — tabelas e RLS
   - `supabase/migrations/0002_colony_photos.sql` — coluna de foto de capa + bucket de storage
   - `supabase/migrations/0003_seed_demo_data.sql` — dados de exemplo (opcional, útil para demo)
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
