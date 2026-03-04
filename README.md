# BarberPro Web - Gestão de Barbearia

Sistema web completo para gestão de barbearias com sincronização em tempo real.

## Funcionalidades

- **Dashboard** - Visão geral com estatísticas em tempo real
- **Agenda** - Agendamentos com navegação por data
- **Equipe** - Cadastro de barbeiros com especialidades e comissões
- **Serviços** - Gestão de serviços e preços
- **Clientes** - Cadastro completo com busca
- **Financeiro** - Controle de receitas e despesas (fixas e variáveis)
- **Comissões** - Controle de comissões por barbeiro
- **Estoque** - Gestão de produtos com alertas de estoque baixo
- **Fidelidade** - Programa de recompensas para clientes
- **Relatórios** - Análise de desempenho com exportação
- **Configurações** - Personalização de cores e horários

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express + tRPC + Drizzle ORM
- **Banco**: MySQL (TiDB Cloud)
- **Deploy**: Netlify (frontend) + Railway (backend)

## Desenvolvimento Local

```bash
npm install
npm run dev
npm run build
```

## Deploy no Netlify

1. Conecte o repositório GitHub ao Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Atualize o `netlify.toml` com a URL real do backend

## Deploy do Backend no Railway

1. Crie projeto no Railway com o backend
2. Configure `DATABASE_URL` e `NODE_ENV=production`
