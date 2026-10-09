import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, User, Menu, X, LogOut, Gavel, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { path: '/buscar?type=sale', label: 'Comprar', icon: Home },
    { path: '/buscar?type=rent', label: 'Alugar', icon: Search },
    { path: '/buscar?type=auction', label: 'Imóveis em Leilão', icon: Gavel },
  ];

  const isActive = (path: string) => {
    const [pathname, query = ''] = path.split('?');
    if (location.pathname !== pathname) return false;
    const targetType = new URLSearchParams(query).get('type');
    return targetType === null || new URLSearchParams(location.search).get('type') === targetType;
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    navigate('/buscar?type=sale');
    setMobileMenuOpen(false);
  };

  const handleAreaCorretor = () => {
    if (user) navigate('/admin');
    else navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="hidden md:flex min-w-0 items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex shrink-0 items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <a href="https://www.icaroimoveis.com.br/"><ArrowLeft className="mr-2 h-4 w-4" />Site principal</a>
            </Button>
            {user ? (
              <>
                <Link to="/admin">
                  <Button variant="outline" size="sm"><User className="mr-2 h-4 w-4" />Painel</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleAreaCorretor}><User className="mr-2 h-4 w-4" />Área do Corretor</Button>
            )}
          </div>

          <button
            className="ml-auto rounded-lg p-2 hover:bg-secondary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="animate-fade-in border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                    isActive(link.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              <a
                href="https://www.icaroimoveis.com.br/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />Voltar ao site principal
              </a>

              {user ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <User className="h-5 w-5" />Painel do Corretor
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <LogOut className="h-5 w-5" />Sair
                  </button>
                </>
              ) : (
                <button onClick={handleAreaCorretor} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <User className="h-5 w-5" />Área do Corretor
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
