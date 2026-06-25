# Felines

Plataforma comunitária que mapeia colônias de gatos de rua em Natal, RN, ajuda vizinhos a entenderem o comportamento desses gatos e conecta quem cuida, quem avista e quem precisa de ajuda em uma emergência. Projeto construído para o hackathon **Hack the Kitty** (24/06/2026 – 07/07/2026).

## O que a plataforma faz

- **Mapeia colônias** de gatos de rua com localização aproximada (proteção de privacidade por blur progressivo — veja abaixo) e situação de castração.
- **Conecta cuidadores**: qualquer pessoa logada pode se vincular como cuidador de uma colônia, registrar alimentações e atualizar o status dos gatos.
- **Relatos da comunidade**: qualquer pessoa pode relatar avistamentos, emergências (gato ferido, maus-tratos, surto de doença, ameaça à colônia) ou um gato perdido — com ou sem conta, dependendo da sensibilidade do relato.
- **Educa**: um guia de artigos por nível, com progresso salvo por usuário, ajuda quem nunca cuidou de gatos de rua a entender o básico antes de agir.
- **Orienta em emergências**: o botão "Preciso de ajuda" abre um assistente que pergunta o que está acontecendo e guia a pessoa — incluindo um fluxo dedicado para gato perdido, com avistamentos da comunidade.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS v4, Leaflet/react-leaflet, Supabase (Postgres + Auth + Storage), OpenWeatherMap, deploy planejado no Netlify.

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
3. No SQL Editor do Supabase, rode todos os arquivos de `supabase/migrations/` **em ordem numérica** (0001, 0002, 0003...). Cada um assume que os anteriores já rodaram. Destaques:
   - `0001_init.sql` — schema inicial e políticas de RLS
   - `0002_colony_photos.sql` — foto de capa da colônia + bucket de storage
   - `0003_seed_demo_data.sql` — dados de exemplo (opcional, útil para demo)
   - `0009_delete_policies.sql` — políticas de delete que faltavam no schema inicial
   - `0016_progressive_location_blur.sql` e `0017_fix_exact_location_grant.sql` — blur progressivo de localização (veja "Privacidade e segurança")
   - `0024_public_report_pins.sql` / `0025_public_report_history_and_confirmations.sql` — acesso público (e restrito por coluna) a relatos
   - `0033_avatar_and_timeline_photos.sql` — foto de perfil e fotos na linha do tempo da colônia
   - Os demais arquivos numerados são correções, RPCs (confirmação de relato, localização exata, marcar gato como visto) e limpezas de dados de teste feitas durante o desenvolvimento.
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000).

## Páginas

- `/` — home: apresentação da plataforma e índice de artigos educacionais (a página "aprender" foi mesclada aqui)
- `/map` — mapa interativo de colônias, avistamentos e emergências, com busca, filtros e um painel de atividades sempre visível que mostra o que está na área visível do mapa naquele momento (atualiza ao mover/dar zoom)
- `/colony/[id]` — detalhe de uma colônia: narrativa, status de castração, gatos cadastrados, linha do tempo (com histórico de fotos) e ações (registrar alimentação, tornar-se cuidador, editar)
- `/colony/new` — cadastro de colônia por endereço (requer login)
- `/learn/[slug]` — artigo individual do guia educacional, com progresso salvo
- `/login`, `/signup` — autenticação
- `/profile` — perfil do usuário: foto, nome de exibição, colônias vinculadas, relatos das suas colônias, histórico de contribuições e progresso no guia
- `/u/[id]` — página pública de um cuidador (colônias, relatos feitos, confirmações dadas)
- `/reports` — lista de relatos abertos, com filtro por tipo, confirmação/resolução e o fluxo de avistamento de gato perdido (requer login)

O botão **"Preciso de ajuda"**, disponível em qualquer página pela navbar, abre um modal com um assistente de 2 passos: o que está acontecendo → onde você está → orientação específica e, quando aplicável, registro direto de um relato (inclusive o fluxo completo de gato perdido, com foto obrigatória e aviso a quem encontrar o gato).

## Privacidade e segurança

- **Blur progressivo de localização**: a posição exata de uma colônia só é visível para quem a criou ou é cuidador vinculado (via uma função `SECURITY DEFINER` que revalida o vínculo no banco). Visitantes anônimos veem um círculo de incerteza bem largo; usuários logados veem um círculo mais estreito — em nenhum dos dois casos o pin exato é exposto.
- **Acesso restrito por coluna**: dados sensíveis de relatos (descrição, foto, quem criou) só são legíveis por usuários autenticados; visitantes anônimos só recebem o necessário para desenhar o pin no mapa (tipo, status, coordenadas). Isso é reforçado no nível do banco (grants por coluna), não só na interface.
- **Relatos sensíveis** (maus-tratos, envenenamento) podem ser feitos sem conta.
- **Uploads de foto** (colônia, gato, perfil, relato) são validados por tamanho/tipo no cliente e por limite no bucket do Supabase Storage; o nome do arquivo salvo nunca usa o nome original enviado pelo usuário, evitando vazamento de informação e colisão de paths.

## Funcionalidades extras

- Banner de clima (OpenWeatherMap) com alertas de calor extremo/chuva forte em `/map` e `/colony/[id]`
- Gerenciamento de gatos da colônia (adicionar, marcar castrado, marcar visto hoje, editar, remover) para criador/cuidadores
- Carta para o próximo cuidador em cada colônia
- Linha do tempo da colônia com histórico de fotos: ao trocar a foto de capa, a anterior é preservada como um evento; também é possível adicionar fotos avulsas sem trocar a capa
- "Mapa de calor" no `/map` (apenas logado) destacando colônias que precisam de atenção (relato aberto e/ou sem alimentação registrada há 7+ dias)
- Sistema de confirmação de relatos (3 confirmações da comunidade resolve automaticamente) e resolução manual por cuidador/criador
- Fluxo de gato perdido com avistamentos da comunidade vinculados ao relato original
- Fatos rápidos rotativos com fontes, progresso de leitura do guia, e marcação de artigos lidos
