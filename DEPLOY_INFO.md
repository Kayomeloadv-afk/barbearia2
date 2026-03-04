# Deploy Info - BarberPro Web

## Netlify (Frontend)
- **URL**: https://barberpro-gestao.netlify.app
- **Site ID**: 75d3e025-c3a9-4692-b832-03e9f0c07256
- **Build Logs**: https://app.netlify.com/projects/barberpro-gestao/deploys

## Backend (Manus Server)
- **API URL**: https://3000-irovzgh2q8dx488taom8l-88a7ad1c.us2.manus.computer
- **Banco de Dados**: MySQL (TiDB Cloud) - configurado no projeto barbershop-app

## Notas
- O frontend está hospedado no Netlify
- O backend está rodando no servidor Manus (precisa migrar para Railway para produção permanente)
- O netlify.toml contém redirects para a API
- Dados são sincronizados em tempo real via polling a cada 5 segundos
