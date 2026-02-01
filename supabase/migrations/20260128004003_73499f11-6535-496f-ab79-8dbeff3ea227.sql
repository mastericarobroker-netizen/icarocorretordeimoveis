-- Adicionar coluna user_id para vincular imóveis a corretores
ALTER TABLE public.properties
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas por corretor
CREATE INDEX idx_properties_user_id ON public.properties(user_id);