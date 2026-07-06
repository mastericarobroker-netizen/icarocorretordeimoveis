import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
    const phoneNumber = '5512991968709';
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            aria-label="Falar no WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
            <span className="absolute right-full mr-3 bg-white text-foreground px-2 py-1 rounded shadow-md text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                Fale conosco
            </span>
        </a>
    );
}
