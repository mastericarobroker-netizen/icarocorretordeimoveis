# Integrar os imóveis em destaque ao site institucional

O portal salva a seleção no Supabase do projeto `yvzhiejargcejzjgrqwx`. O site institucional lê a view pública `homepage_property_cards_public`, que retorna somente os quatro imóveis selecionados e os campos necessários para os cards.

## Configuração no site institucional

Configure estas variáveis públicas no ambiente de build do site (por exemplo, Vite):

```env
VITE_SUPABASE_URL=https://yvzhiejargcejzjgrqwx.supabase.co
VITE_SUPABASE_ANON_KEY=<chave pública anon do projeto Supabase>
```

A chave `anon`/publishable é própria para uso no navegador e está sujeita às permissões RLS do Supabase. **Nunca coloque a chave `service_role` no frontend.** Se o site institucional já inicializa Supabase para o mesmo projeto, reutilize o cliente existente e não crie um segundo.

## Consulta React + Supabase JS

Instale `@supabase/supabase-js` se o projeto ainda não tiver a dependência e use:

```tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const PROPERTY_PORTAL = 'https://imoveis.icaroimoveis.com.br';

type HomepagePropertyCard = {
  position: number;
  property_id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  images: string[] | null;
  listing_type: 'sale' | 'rent' | 'auction';
  auction_modality: string | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
};

export function FeaturedProperties() {
  const [properties, setProperties] = useState<HomepagePropertyCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error } = await supabase
        .from('homepage_property_cards_public')
        .select('position, property_id, title, price, city, state, images, listing_type, auction_modality, type, bedrooms, bathrooms, area')
        .order('position', { ascending: true })
        .limit(4);

      if (active) {
        if (error) console.error('Não foi possível carregar os imóveis em destaque', error);
        else setProperties((data ?? []) as HomepagePropertyCard[]);
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <p>Carregando imóveis...</p>;
  if (properties.length === 0) return null;

  return (
    <section aria-labelledby="featured-properties-title">
      <h2 id="featured-properties-title">Imóveis em destaque</h2>
      <div className="property-cards">
        {properties.map((property) => (
          <a
            className="property-card"
            key={property.property_id}
            href={`${PROPERTY_PORTAL}/imovel/${property.property_id}`}
          >
            {property.images?.[0] && <img src={property.images[0]} alt={property.title} loading="lazy" />}
            <h3>{property.title}</h3>
            <p>{property.city} - {property.state}</p>
            <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
```

A consulta já devolve as posições em ordem crescente. Ao clicar em um card, o visitante abre o anúncio original no portal de imóveis. É possível adaptar o markup ao framework e ao visual do site institucional sem alterar a consulta.

## Campos retornados

| Campo | Uso sugerido |
|---|---|
| `position` | Ordem do card, de 1 a 4 |
| `property_id` | Montagem do link do anúncio |
| `title`, `price`, `city`, `state` | Texto principal e localização |
| `images` | Foto de capa em `images[0]` |
| `listing_type`, `auction_modality` | Badge de venda, aluguel ou modalidade do leilão |
| `type`, `bedrooms`, `bathrooms`, `area` | Detalhes opcionais do card |

O endpoint REST equivalente é `https://yvzhiejargcejzjgrqwx.supabase.co/rest/v1/homepage_property_cards_public?select=*&order=position.asc&limit=4`, enviando os headers `apikey: <chave anon>` e `Authorization: Bearer <chave anon>`.
