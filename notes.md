# Bug: Login não funciona

## Problema
O login busca usuários via `appUsersApi.list()` que faz chamada ao backend `/api/trpc/appUsers.list`.
O PIN tem 6 dígitos na tela mas o admin padrão foi criado com PIN de 4 dígitos.
Além disso, o backend pode não ter o admin padrão cadastrado na tabela app_users.

## Solução
1. Mudar PIN para 4 dígitos
2. Adicionar fallback: se API falhar, permitir login com admin padrão hardcoded
3. Criar admin padrão no banco se não existir
