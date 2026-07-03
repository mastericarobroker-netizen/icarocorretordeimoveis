## Plano: Remover Cadastro na Área do Corretor

### Objetivo
Deixar a Área do Corretor apenas com a opção **Entrar**. Novos usuários serão criados manualmente por você no backend.

---

### Alterações na Interface

**Arquivo:** `src/pages/Auth.tsx`
- Remover as `Tabs` (Entrar/Cadastrar) e todo o formulário de cadastro
- Manter apenas o formulário de login (email + senha)
- Ajustar título/descrição do card para refletir apenas login
- Remover estados e handler não usados (`registerName`, `registerEmail`, `registerPassword`, `registerConfirmPassword`, `handleRegister`)

**Arquivo:** `src/contexts/AuthContext.tsx`
- Remover a função `signUp` do contexto (não será mais usada em lugar nenhum)

Nenhuma alteração no banco, RLS ou rotas.

---

### Como Cadastrar Novos Usuários Manualmente

Você tem duas formas de criar corretores pela plataforma Lovable Cloud (sem precisar do formulário público):

1. **Painel Backend do Lovable Cloud** (recomendado)
   - Abrir o backend pelo botão "View Backend" no chat
   - Ir em **Users** → **Add user** → informar email e senha
   - O trigger `handle_new_user` cria o registro em `profiles` automaticamente
   - Depois, se quiser, atribuir imóveis àquele usuário via update em `properties.user_id`

2. **Me pedir aqui no chat**
   - Basta dizer: "cria o usuário fulano@email.com com senha X" que eu executo o comando de criação e já vinculo aos imóveis que você indicar.

---

### Sobre "acesso ao banco e chaves KEY"

No Lovable Cloud, o banco é gerenciado — algumas chaves são públicas e outras não ficam expostas por segurança:

**Disponíveis (já configuradas no projeto):**
- `VITE_SUPABASE_URL` — URL pública do backend
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) — chave pública usada no frontend
- Essas duas já estão no `.env` do projeto e podem ser usadas em qualquer client.

**Não disponíveis no Lovable Cloud:**
- Senha do banco de dados (Postgres) — não é exposta
- `SERVICE_ROLE_KEY` — não é acessível (evita uso indevido com privilégio total)
- Não há painel externo do provedor de banco para acessar diretamente

**O que você pode usar hoje para gerenciar dados:**
- **View Backend** (botão no chat): interface para ver/editar tabelas, usuários (Auth), storage, logs
- **Pedir aqui no chat**: qualquer SELECT/INSERT/UPDATE/migration eu executo com sua aprovação
- **Export de dados**: Cloud → Advanced settings → Export data (dump completo)

Se precisar de acesso direto via `psql` ou de uma connection string externa, isso exigiria migrar para um Supabase próprio (fora do Cloud gerenciado) — posso explicar esse caminho se quiser.

---

### Resumo

| Item | Ação |
|---|---|
| Aba "Cadastrar" na tela `/login` | Remover |
| Aba "Entrar" | Manter |
| `signUp` no AuthContext | Remover |
| Criação de usuários | Manual via View Backend ou pedindo aqui |
| Chaves de acesso | Apenas URL + anon key (já no `.env`); service role e senha do DB não disponíveis no Cloud |
