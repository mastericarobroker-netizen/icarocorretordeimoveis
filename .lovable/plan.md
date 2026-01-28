
## Plano: Vincular Imóveis ao Corretor

### Visão Geral
Adicionar uma coluna `user_id` na tabela de imóveis para vincular cada propriedade ao corretor responsável, e atribuir todos os imóveis existentes ao usuário `icaro.crsilva@gmail.com`.

---

### Etapa 1: Criar sua Conta de Corretor

Você precisa criar a conta manualmente pelo sistema de autenticação:

1. Acesse a página de login (botão "Área do Corretor" no menu)
2. Clique na aba "Cadastrar"
3. Preencha os dados:
   - **Nome**: Ícaro
   - **Email**: icaro.crsilva@gmail.com
   - **Senha**: Marte.1234
4. Clique em "Criar conta"

Isso é necessário porque senhas são armazenadas de forma segura (criptografadas) e não podem ser definidas diretamente no banco de dados.

---

### Etapa 2: Adicionar Coluna user_id na Tabela Properties

**Migration SQL:**
```sql
-- Adicionar coluna user_id para vincular imóveis a corretores
ALTER TABLE public.properties
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas por corretor
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
```

---

### Etapa 3: Vincular Imóveis Existentes ao Usuário

Após você criar a conta, executarei a atribuição dos imóveis:

```sql
-- Atualizar todos os imóveis para pertencerem ao corretor
UPDATE public.properties
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'icaro.crsilva@gmail.com'
  LIMIT 1
);
```

---

### Etapa 4: Atualizar RLS para Gestão por Corretor (Opcional)

Se desejar que cada corretor veja apenas seus próprios imóveis no painel:

```sql
-- Política: Corretores podem ver apenas seus imóveis
CREATE POLICY "Corretores veem seus imóveis"
ON public.properties FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Política: Corretores podem editar apenas seus imóveis
CREATE POLICY "Corretores editam seus imóveis"
ON public.properties FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

---

### Resumo das Alterações

| Componente | Ação |
|------------|------|
| Usuário | Criar conta via formulário de cadastro |
| `properties` table | Adicionar coluna `user_id` |
| Dados existentes | UPDATE para vincular ao usuário criado |
| `types.ts` | Atualizado automaticamente com nova coluna |

---

### Fluxo de Execução

```text
┌─────────────────────────────────────────────────────┐
│  1. Você cria conta no sistema                      │
│     └─> Email: icaro.crsilva@gmail.com              │
│     └─> Senha: Marte.1234                           │
├─────────────────────────────────────────────────────┤
│  2. Migration adiciona coluna user_id               │
│     └─> ALTER TABLE properties ADD user_id          │
├─────────────────────────────────────────────────────┤
│  3. UPDATE vincula imóveis ao seu usuário           │
│     └─> UPDATE properties SET user_id = (seu id)    │
├─────────────────────────────────────────────────────┤
│  4. (Opcional) RLS restringe acesso por corretor    │
└─────────────────────────────────────────────────────┘
```

---

### Próximos Passos

1. **Crie sua conta** pelo formulário de cadastro
2. **Me avise** quando tiver criado a conta
3. Executarei a migration e o UPDATE para vincular os imóveis
