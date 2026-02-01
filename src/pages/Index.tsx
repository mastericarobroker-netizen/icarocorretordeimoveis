import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { useProperties } from '@/contexts/PropertyContext';
import { Link } from 'react-router-dom';
import { Home, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function Index() {
  const {
    properties
  } = useProperties();
  const featuredProperties = properties.filter(p => p.featured).slice(0, 3);
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="text-xl text-muted-foreground mb-10">O portal imobiliário mais completo de São José dos Campos. Casas, apartamentos e terrenos para comprar ou alugar.</p>
            
            {/* Search Bar */}
            <SearchBar size="large" className="max-w-2xl mx-auto" />
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/buscar?type=sale">
                <Button variant="outline" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Comprar Imóvel
                </Button>
              </Link>
              <Link to="/buscar?type=rent">
                <Button variant="outline" size="lg">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Alugar Imóvel
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Imóveis em Destaque</h2>
                <p className="text-muted-foreground mt-2">
                  Selecionamos os melhores imóveis para você
                </p>
              </div>
              <Link to="/buscar">
                <Button variant="outline">Ver todos os imóveis</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => <PropertyCard key={property.id} property={property} variant="featured" />)}
            </div>
          </div>
        </section>}

      {/* Trust Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Por que escolher o Ícaro Correto de Imóveis?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Garantida</h3>
              <p className="text-muted-foreground">
                Todos os imóveis são verificados e a documentação é analisada por nossa equipe.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Melhores Preços</h3>
              <p className="text-muted-foreground">
                Negociamos as melhores condições para você realizar o seu sonho.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atendimento Personalizado</h3>
              <p className="text-muted-foreground">
                Nossa equipe está pronta para ajudá-lo em todas as etapas da compra ou aluguel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Quer vender ou alugar seu imóvel?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Anuncie com a gente e alcance milhares de interessados. Avaliação gratuita e sem compromisso.
            </p>
            <Link to="/admin">
              <Button size="lg" variant="secondary">
                Anunciar meu imóvel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Ícaro Corretor de Imóveis</span>
              </div>
              <p className="text-background/70 text-sm">O melhor portal imobiliário de São José dos Campos. Encontre seu próximo lar conosco.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navegação</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li><Link to="/buscar?type=sale" className="hover:text-background">Comprar</Link></li>
                <li><Link to="/buscar?type=rent" className="hover:text-background">Alugar</Link></li>
                <li><Link to="/admin" className="hover:text-background">Área do Corretor</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Regiões</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li>São José dos Campos<Link to="/buscar?q=Centro" className="hover:text-background">Centro</Link></li>
                <li>Jacareí<Link to="/buscar?q=Jurerê" className="hover:text-background">Jurerê</Link></li>
                <li>Caçapava<Link to="/buscar?q=Lagoa" className="hover:text-background">Lagoa da Conceição</Link></li>
                <li><Link to="/buscar?q=Campeche" className="hover:text-background">Campeche</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li>(12) 99196-8709</li>
                <li>icaro@icarobroker.com.br</li>
                <li>São José dos Campos, SP</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/50 text-sm">© 2026 Ícaro Corretor de Imóveis. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>;
}