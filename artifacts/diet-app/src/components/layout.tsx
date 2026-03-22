import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Leaf, User, LogOut, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Nutri<span className="text-primary">Life</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/plan" 
                  className="hidden md:flex text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Meu Plano
                </Link>
                <Link 
                  href="/profile" 
                  className="hidden md:flex text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Perfil
                </Link>
                <div className="h-8 w-[1px] bg-border hidden md:block"></div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-foreground leading-none">
                      {user.firstName || user.email?.split('@')[0] || 'Usuário'}
                    </span>
                  </div>
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-primary/20 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {user.firstName?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <button 
                    onClick={logout}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-1"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-5 py-2.5 rounded-xl font-semibold bg-white border border-border text-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              >
                Entrar com Google
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 border-t border-border/50 bg-background mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NutriLife. Construído com Replit.</p>
        </div>
      </footer>
    </div>
  );
}

export function PremiumButton({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost', isLoading?: boolean }) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 ease-out outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        variant === 'primary' && "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-[0_8px_16px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-70 disabled:hover:transform-none",
        variant === 'outline' && "bg-card border-2 border-border text-foreground shadow-sm hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10",
        variant === 'ghost' && "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary active:bg-border",
        isLoading && "opacity-80 cursor-wait",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && children}
    </button>
  );
}
