import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PropertyCaptureFormProps {
    onSuccess?: () => void;
}

const WHATSAPP_NUMBER = '5512991968709'; // +55 12 99196-8709

export function PropertyCaptureForm({ onSuccess }: PropertyCaptureFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format message for WhatsApp
            const message = `*Novo Anúncio de Imóvel*\n\n*Nome:* ${formData.name}\n*Telefone:* ${formData.phone}\n*Endereço:* ${formData.address}\n*Descrição:* ${formData.description}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            toast.success('Redirecionando para WhatsApp...');
            setFormData({
                name: '',
                phone: '',
                address: '',
                description: '',
            });
            onSuccess?.();
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            toast.error('Erro ao abrir WhatsApp. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nome Completo
                </label>
                <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                />
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Telefone / WhatsApp
                </label>
                <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(12) 99999-9999"
                />
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Endereço do Imóvel
                </label>
                <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Descrição Breve
                </label>
                <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Conte-nos um pouco sobre o imóvel (ex: 3 quartos, sol da manhã...)"
                    rows={4}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
        </form>
    );
}
