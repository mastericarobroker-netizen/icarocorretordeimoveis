
## Plano: Upload de Imagens para Imóveis (até 5 fotos)

### Visão Geral
Implementar funcionalidade de upload de imagens do computador do usuário, permitindo até 5 fotos por imóvel, com armazenamento no Lovable Cloud.

---

### Etapa 1: Criar Bucket de Armazenamento
Criar um bucket público chamado `property-images` para armazenar as fotos dos imóveis.

**Migration SQL:**
```sql
-- Criar bucket para imagens de imóveis
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Permitir upload público (para simplificar - pode adicionar auth depois)
CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

-- Permitir visualização pública
CREATE POLICY "Imagens são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Permitir deleção
CREATE POLICY "Permitir deletar imagens"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images');
```

---

### Etapa 2: Criar Componente de Upload
Novo arquivo: `src/components/ImageUploader.tsx`

**Funcionalidades:**
- Aceitar arquivos de imagem (JPG, PNG, WebP)
- Limite de 5 imagens
- Preview das imagens selecionadas
- Barra de progresso durante upload
- Botão para remover imagens
- Drag and drop (opcional)

**Interface do componente:**
```typescript
interface ImageUploaderProps {
  images: string[];           // URLs das imagens atuais
  onImagesChange: (urls: string[]) => void;  // Callback quando mudar
  maxImages?: number;         // Máximo de imagens (default: 5)
}
```

**Layout visual:**
```text
┌─────────────────────────────────────────────────────┐
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Img1 │ │ Img2 │ │ Img3 │ │  +   │ │      │      │
│  │  ✕   │ │  ✕   │ │  ✕   │ │      │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                                     │
│  [Clique ou arraste para adicionar fotos]          │
│  Máximo: 5 imagens • Formatos: JPG, PNG, WebP      │
└─────────────────────────────────────────────────────┘
```

---

### Etapa 3: Criar Hook de Upload
Novo arquivo: `src/hooks/useImageUpload.ts`

**Funcionalidades:**
- Upload de arquivo para o Storage
- Retorno da URL pública
- Gerenciamento de estado de loading
- Tratamento de erros
- Deleção de imagens

```typescript
export function useImageUpload() {
  const uploadImage = async (file: File): Promise<string> => {
    // Gera nome único para o arquivo
    // Faz upload para bucket 'property-images'
    // Retorna URL pública
  };
  
  const deleteImage = async (url: string): Promise<void> => {
    // Extrai path do arquivo da URL
    // Remove do storage
  };
  
  return { uploadImage, deleteImage, isUploading };
}
```

---

### Etapa 4: Atualizar Formulário do Admin
Arquivo: `src/pages/Admin.tsx`

**Alterações:**
1. Importar o novo componente `ImageUploader`
2. Substituir o input de URL pelo componente de upload
3. Atualizar o `formData.images` com as URLs retornadas

**Antes (linha 350-360):**
```tsx
<div className="col-span-2">
  <label className="text-sm font-medium">URL da Imagem</label>
  <Input
    value={formData.images[0]}
    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
    placeholder="https://..."
    required
  />
</div>
```

**Depois:**
```tsx
<div className="col-span-2">
  <label className="text-sm font-medium">Fotos do Imóvel (máx. 5)</label>
  <ImageUploader
    images={formData.images}
    onImagesChange={(images) => setFormData({ ...formData, images })}
    maxImages={5}
  />
</div>
```

---

### Etapa 5: Validações e UX

**Validações de arquivo:**
- Tamanho máximo: 5MB por imagem
- Tipos permitidos: image/jpeg, image/png, image/webp
- Quantidade máxima: 5 imagens

**Feedback visual:**
- Loading spinner durante upload
- Barra de progresso
- Toast de sucesso/erro
- Confirmação ao remover imagem

---

### Resumo das Alterações

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/...` | Criar bucket `property-images` com políticas RLS |
| `src/hooks/useImageUpload.ts` | Novo hook para upload/delete de imagens |
| `src/components/ImageUploader.tsx` | Novo componente de upload com preview |
| `src/pages/Admin.tsx` | Substituir input de URL pelo ImageUploader |

---

### Detalhes Técnicos

**Estrutura do Storage:**
```
property-images/
├── {uuid1}.jpg
├── {uuid2}.png
└── {uuid3}.webp
```

**URL pública gerada:**
```
https://cofugilxrxujpcjluhxt.supabase.co/storage/v1/object/public/property-images/{filename}
```

**Fluxo de upload:**
1. Usuário seleciona arquivo(s)
2. Valida tipo e tamanho
3. Gera nome único (UUID)
4. Faz upload para Supabase Storage
5. Obtém URL pública
6. Adiciona ao array de imagens do formulário
7. Ao salvar imóvel, URLs são persistidas na coluna `images`
