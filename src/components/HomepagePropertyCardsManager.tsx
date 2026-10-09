import { useEffect, useMemo, useState } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHomepagePropertyCards, useSaveHomepagePropertyCards } from '@/hooks/useHomepagePropertyCards';
import { toast } from 'sonner';
import { Loader2, Save, Star } from 'lucide-react';

const SLOT_COUNT = 4;
const EMPTY_SLOT = '__empty__';

interface HomepagePropertyCardsManagerProps {
  properties: Property[];
}

export function HomepagePropertyCardsManager({ properties }: HomepagePropertyCardsManagerProps) {
  const { data: savedCards, isLoading, isError } = useHomepagePropertyCards();
  const saveCards = useSaveHomepagePropertyCards();
  const [selectedIds, setSelectedIds] = useState<string[]>(Array(SLOT_COUNT).fill(''));

  useEffect(() => {
    if (!savedCards) return;
    const slots = Array(SLOT_COUNT).fill('') as string[];
    savedCards.forEach(({ position, property_id }) => {
      slots[position - 1] = property_id;
    });
    setSelectedIds(slots);
  }, [savedCards]);

  const selectedSet = useMemo(() => new Set(selectedIds.filter(Boolean)), [selectedIds]);

  const handleSave = async () => {
    const orderedIds = selectedIds.filter(Boolean);
    if (new Set(orderedIds).size !== orderedIds.length) {
      toast.error('Escolha imóveis diferentes em cada posição.');
      return;
    }

    try {
      await saveCards.mutateAsync(orderedIds);
      toast.success('Destaques da página principal salvos.');
    } catch (error) {
      console.error('Falha ao salvar destaques da página principal:', error);
      const message = error instanceof Error ? error.message : 'Erro inesperado.';
      toast.error(`Não foi possível salvar os destaques: ${message}`);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="homepage-cards-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="homepage-cards-title" className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Star className="h-5 w-5 text-primary" />
            Destaques da página principal
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha até quatro imóveis e defina a ordem em que aparecerão no site institucional.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || isError || saveCards.isPending}>
          {saveCards.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar destaques
        </Button>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Não foi possível carregar a seleção atual dos destaques.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando destaques...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: SLOT_COUNT }, (_, index) => (
            <div key={index} className="space-y-1.5">
              <label htmlFor={`homepage-card-${index + 1}`} className="text-sm font-medium">Card {index + 1}</label>
              <Select
                value={selectedIds[index] || EMPTY_SLOT}
                onValueChange={(value) => {
                  const nextIds = [...selectedIds];
                  nextIds[index] = value === EMPTY_SLOT ? '' : value;
                  setSelectedIds(nextIds);
                }}
              >
                <SelectTrigger id={`homepage-card-${index + 1}`}>
                  <SelectValue placeholder="Não exibir imóvel nesta posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SLOT}>Não exibir imóvel</SelectItem>
                  {properties.map((property) => {
                    const selectedInAnotherSlot = selectedSet.has(property.id) && selectedIds[index] !== property.id;
                    const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price);
                    return (
                      <SelectItem key={property.id} value={property.id} disabled={selectedInAnotherSlot}>
                        {property.title} — {property.city} — {price}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">A ordem dos cards preenchidos é mantida; posições vazias são ignoradas.</p>
    </section>
  );
}
