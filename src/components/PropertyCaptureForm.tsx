import { useState } from 'react';
import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PropertyCaptureFormProps {
    onSuccess?: () => void;
}

export function PropertyCaptureForm({ onSuccess }: PropertyCaptureFormProps) {
    const { addCapture } = useProperties();
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
            await addCapture(formData);
            toast.success('Solicitação enviada com sucesso! Entraremos em contato em breve.');
            setFormData({
                name: '',
                phone: '',
                address: '',
                description: '',
            });
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting capture:', error);
            toast.error('Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
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
