import { useParams, Link } from 'react-router-dom';
import { useProperties } from '@/contexts/PropertyContext';
import { PropertyGallery } from '@/components/PropertyGallery';
import { LeadForm } from '@/components/LeadForm';
import { PropertyMap } from '@/components/PropertyMap';
import { Button } from '@/components/ui/button';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Car,
  ArrowLeft,
  Share2,
  Heart,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { getPropertyById } = useProperties();
  
  const property = id ? getPropertyById(id) : undefined;

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Imóvel não encontrado
          </h1>
          <Link to="/buscar">
            <Button>Voltar para busca</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
    return listingType === 'rent' ? `${formatted}/mês` : formatted;
  };

  const typeLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Apartamento',
    condo: 'Cobertura',
    land: 'Terreno',
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property.title,
        text: `Confira este imóvel: ${property.title}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/buscar"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar para busca</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery images={property.images} title={property.title} />

            {/* Price and Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded ${
                    property.listingType === 'sale'
                      ? 'bg-success text-success-foreground'
                      : 'bg-warning text-warning-foreground'
                  }`}
                >
                  {property.listingType === 'sale' ? 'Venda' : 'Aluguel'}
                </span>
                <span className="px-3 py-1 text-sm font-semibold bg-secondary text-secondary-foreground rounded">
                  {typeLabels[property.type]}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {formatPrice(property.price, property.listingType)}
              </h1>

              <h2 className="text-xl text-foreground mb-4">{property.title}</h2>

              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.address}, {property.city} - {property.state}, {property.zipCode}
              </p>
            </div>

            {/* Quick Stats */}
            {property.type !== 'land' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">
                    {property.bedrooms}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quarto{property.bedrooms !== 1 && 's'}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">
                    {property.bathrooms}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Banheiro{property.bathrooms !== 1 && 's'}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">
                    {property.area}
                  </p>
                  <p className="text-sm text-muted-foreground">m²</p>
                </div>
                {property.parking !== undefined && (
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground">
                      {property.parking}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vaga{property.parking !== 1 && 's'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Descrição
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Características
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-success" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.yearBuilt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ano de construção:</span>
                    <span className="font-medium text-foreground">
                      {property.yearBuilt}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Área total:</span>
                  <span className="font-medium text-foreground">
                    {property.area} m²
                  </span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Localização
              </h3>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <PropertyMap
                  properties={[property]}
                  center={[property.lat, property.lng]}
                  zoom={15}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Lead Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-36">
              <LeadForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
