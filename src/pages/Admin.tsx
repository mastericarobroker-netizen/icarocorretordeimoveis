import { useState } from 'react';
import { useProperties } from '@/contexts/PropertyContext';
import { Property, Lead, PropertyCapture } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Home,
  MessageSquare,
  Eye,
  Clipboard,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageUploader } from '@/components/ImageUploader';

type PropertyFormData = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  price: 0,
  address: '',
  city: 'Florianópolis',
  state: 'SP',
  zipCode: '',
  lat: -27.5969,
  lng: -48.5495,
  bedrooms: 1,
  bathrooms: 1,
  area: 0,
  type: 'house',
  listingType: 'sale',
  images: [],
  features: [],
  parking: 1,
};

export default function Admin() {
  const {
    properties,
    leads,
    captures,
    addProperty,
    updateProperty,
    deleteProperty,
    updateLead,
    deleteLead,
    updateCapture,
    deleteCapture
  } = useProperties();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false);
  const [editingCapture, setEditingCapture] = useState<PropertyCapture | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'properties' | 'leads' | 'captures'>('properties');
  const [featuresInput, setFeaturesInput] = useState('');

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        lat: property.lat,
        lng: property.lng,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type,
        listingType: property.listingType,
        images: property.images,
        features: property.features,
        yearBuilt: property.yearBuilt,
        parking: property.parking,
      });
      setFeaturesInput(property.features.join(', '));
    } else {
      setEditingProperty(null);
      setFormData(initialFormData);
      setFeaturesInput('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const propertyData = { ...formData, features };

    if (editingProperty) {
      updateProperty(editingProperty.id, propertyData);
      toast.success('Imóvel atualizado com sucesso!');
    } else {
      addProperty(propertyData);
      toast.success('Imóvel cadastrado com sucesso!');
    }

    setIsDialogOpen(false);
    setEditingProperty(null);
    setFormData(initialFormData);
    setFeaturesInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      deleteProperty(id);
      toast.success('Imóvel excluído com sucesso');
    }
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => {
    updateLead(id, { status });
    toast.success('Status do lead atualizado');
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead(id);
      toast.success('Lead excluído com sucesso');
    }
  };

  const handleUpdateCaptureStatus = (id: string, status: PropertyCapture['status']) => {
    updateCapture(id, { status });
    toast.success('Status da captação atualizado');
  };

  const handleDeleteCapture = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta captação?')) {
      deleteCapture(id);
      toast.success('Captação excluída com sucesso');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Novo':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Novo</Badge>;
      case 'Tratando':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100"><AlertCircle className="w-3 h-3 mr-1" /> Tratando</Badge>;
      case 'Finalizado':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Finalizado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel do Corretor</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus imóveis e leads
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProperty ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Casa Moderna com Vista para o Mar"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo do Imóvel</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Property['type']) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="condo">Cobertura</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo de Oferta</label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(value: Property['listingType']) =>
                        setFormData({ ...formData, listingType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="rent">Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Preço (R$)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Área (m²)</label>
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Quartos</label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Banheiros</label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Vagas</label>
                    <Input
                      type="number"
                      value={formData.parking}
                      onChange={(e) =>
                        setFormData({ ...formData, parking: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ano de Construção</label>
                    <Input
                      type="number"
                      value={formData.yearBuilt || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearBuilt: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Ex: Rua das Palmeiras, 150"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cidade</label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">CEP</label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) =>
                        setFormData({ ...formData, lat: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) =>
                        setFormData({ ...formData, lng: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium">Fotos do Imóvel (máx. 5)</label>
                    <ImageUploader
                      images={formData.images}
                      onImagesChange={(images) => setFormData({ ...formData, images })}
                      maxImages={5}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium">
                      Características (separadas por vírgula)
                    </label>
                    <Input
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="Ex: Piscina, Churrasqueira, Vista Mar"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descreva o imóvel..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProperty ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'properties' ? 'default' : 'outline'}
            onClick={() => setActiveTab('properties')}
          >
            <Home className="h-4 w-4 mr-2" />
            Imóveis ({properties.length})
          </Button>
          <Button
            variant={activeTab === 'leads' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leads')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Leads ({leads.length})
          </Button>
          <Button
            variant={activeTab === 'captures' ? 'default' : 'outline'}
            onClick={() => setActiveTab('captures')}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Captação ({captures.length})
          </Button>
        </div>

        {/* Properties Table */}
        {activeTab === 'properties' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {property.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {property.bedrooms} quartos • {property.area} m²
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${property.listingType === 'sale'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                            }`}
                        >
                          {property.listingType === 'sale' ? 'Venda' : 'Aluguel'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(property.price)}
                      </TableCell>
                      <TableCell>{property.city}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link to={`/imovel/${property.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(property)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(property.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {activeTab === 'leads' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              {leads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{lead.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {lead.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {lead.message}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value: any) => handleUpdateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Novo">Novo</SelectItem>
                              <SelectItem value="Tratando">Tratando</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingLead(lead);
                                setIsLeadDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum lead recebido ainda
                  </h3>
                  <p className="text-muted-foreground">
                    Os contatos dos interessados aparecerão aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Captures Table */}
        {activeTab === 'captures' && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              {captures.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Endereço do Imóvel</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {captures.map((capture) => (
                      <TableRow key={capture.id}>
                        <TableCell className="font-medium text-foreground">{capture.name}</TableCell>
                        <TableCell>
                          <p className="text-sm">{capture.phone}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{capture.address}</p>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {capture.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={capture.status}
                            onValueChange={(value: any) => handleUpdateCaptureStatus(capture.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Novo">Novo</SelectItem>
                              <SelectItem value="Tratando">Tratando</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(capture.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCapture(capture);
                                setIsCaptureDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => handleDeleteCapture(capture.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center">
                  <Clipboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma captação recebida ainda
                  </h3>
                  <p className="text-muted-foreground">
                    As solicitações de anúncios de proprietários aparecerão aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Lead Dialog */}
        <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingLead) {
                  updateLead(editingLead.id, editingLead);
                  toast.success('Lead atualizado com sucesso');
                  setIsLeadDialogOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={editingLead?.name || ''}
                  onChange={(e) => setEditingLead(editingLead ? { ...editingLead, name: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={editingLead?.email || ''}
                  onChange={(e) => setEditingLead(editingLead ? { ...editingLead, email: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={editingLead?.phone || ''}
                  onChange={(e) => setEditingLead(editingLead ? { ...editingLead, phone: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={editingLead?.message || ''}
                  onChange={(e) => setEditingLead(editingLead ? { ...editingLead, message: e.target.value } : null)}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Capture Dialog */}
        <Dialog open={isCaptureDialogOpen} onOpenChange={setIsCaptureDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Captação</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingCapture) {
                  updateCapture(editingCapture.id, editingCapture);
                  toast.success('Captação atualizada com sucesso');
                  setIsCaptureDialogOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Nome do Proprietário</label>
                <Input
                  value={editingCapture?.name || ''}
                  onChange={(e) => setEditingCapture(editingCapture ? { ...editingCapture, name: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={editingCapture?.phone || ''}
                  onChange={(e) => setEditingCapture(editingCapture ? { ...editingCapture, phone: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={editingCapture?.address || ''}
                  onChange={(e) => setEditingCapture(editingCapture ? { ...editingCapture, address: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={editingCapture?.description || ''}
                  onChange={(e) => setEditingCapture(editingCapture ? { ...editingCapture, description: e.target.value } : null)}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
