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

-- Permitir atualização
CREATE POLICY "Permitir atualizar imagens"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images');