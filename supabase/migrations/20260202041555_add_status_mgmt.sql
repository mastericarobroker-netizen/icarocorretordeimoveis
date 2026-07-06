-- Adicionar coluna 'status' na tabela leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Tratando', 'Finalizado'));

-- Adicionar coluna 'status' na tabela property_captures
ALTER TABLE public.property_captures 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Tratando', 'Finalizado'));

-- Habilitar atualização e deleção para leads (usuários autenticados)
CREATE POLICY "Allow authenticated updates on leads" 
ON public.leads 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated deletes on leads" 
ON public.leads 
FOR DELETE 
TO authenticated 
USING (true);

-- Habilitar atualização e deleção para property_captures (usuários autenticados)
CREATE POLICY "Allow authenticated updates on property_captures" 
ON public.property_captures 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated deletes on property_captures" 
ON public.property_captures 
FOR DELETE 
TO authenticated 
USING (true);
