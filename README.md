# Hidráulica Dutra · site

Site institucional com foco em SEO local (encanador 24h em São Paulo). Feito com [Astro](https://astro.build), gera páginas estáticas e é publicado na Vercel.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Telefone/WhatsApp, nome, tempo de chegada | `src/data/site.ts` |
| Serviços (textos, FAQ, SEO) | `src/data/servicos.ts` |
| Bairros atendidos | `src/data/bairros.ts` |
| Posts do blog | `src/content/blog/*.md` |
| Animação do topo da home | `src/components/HeroVisual.astro` |

Cada serviço vira `/servicos/<slug>/`, cada bairro vira `/encanador-em-<slug>/` e cada post vira `/blog/<arquivo>/`. O sitemap é gerado automaticamente.
