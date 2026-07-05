
# Recriar o banco no seu Supabase próprio

Vou preparar tudo o que você precisa para replicar este projeto num Supabase criado por você (fora do Lovable Cloud). Nenhuma alteração será feita no app enquanto isso — o Lovable Cloud continua ativo neste projeto.

## O que será entregue

Todos os arquivos serão salvos em `/mnt/documents/supabase-migration/` para você baixar.

### 1. `schema.sql` — estrutura completa
- Extensões necessárias (`pgcrypto`)
- Tabelas `public.profiles`, `public.properties`, `public.leads` (com todas as colunas atuais)
- Funções: `update_updated_at_column()`, `handle_new_user()`
- Trigger `on_auth_user_created` em `auth.users` para criar profile automaticamente
- Triggers `updated_at` nas tabelas relevantes
- `GRANT`s para `authenticated`, `anon` e `service_role`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Todas as policies RLS existentes (leads, profiles, properties)

### 2. `storage.sql` — bucket de imagens
- Criação do bucket `property-images` (público)
- Policies de storage (upload/read/delete pelo dono)

### 3. `data/` — dados atuais em CSV
- `profiles.csv`
- `properties.csv`
- `leads.csv`
- Instruções de import via SQL Editor do Supabase (`COPY ... FROM`)
- Observação: usuários do `auth.users` **não podem** ser exportados/importados por SQL — você precisará recriá-los manualmente no painel Auth do seu Supabase usando os **mesmos UUIDs** (senão os `user_id` das propriedades ficam órfãos). Vou listar os UUIDs e emails atuais num arquivo `auth-users.txt` para facilitar.

### 4. `storage-files/` — imagens do bucket
- Download de todos os arquivos do bucket `property-images` preservando os caminhos
- Script `upload.sh` (usando `curl` + Storage API do seu Supabase) para reenviar

### 5. `README.md` — passo a passo
Ordem de execução:
1. Criar projeto no Supabase → copiar URL e anon key
2. Recriar usuários em Auth → Users (mantendo UUIDs)
3. Rodar `schema.sql` no SQL Editor
4. Rodar `storage.sql` no SQL Editor
5. Importar CSVs (`profiles`, `properties`, `leads`)
6. Rodar `upload.sh` para reenviar imagens
7. Atualizar `.env` do seu app com as novas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`

## Detalhes técnicos

- O schema será gerado consultando o `information_schema` e `pg_policies` do banco atual via `psql` para garantir fidelidade 100%.
- Exports de dados usam `COPY ... TO STDOUT WITH CSV HEADER`.
- Imagens serão baixadas via URL pública do bucket (já é `public: true`).
- Não é possível exportar hashes de senha do `auth.users` — usuários precisarão redefinir senha no novo projeto (ou você define uma temporária ao recriá-los).

## Fora do escopo

- **Não** vou desconectar o Lovable Cloud deste projeto (não é possível remover Cloud de um projeto onde já foi ativado).
- **Não** vou alterar o app para apontar para o novo Supabase agora — isso é um passo separado depois que você validar a migração.
