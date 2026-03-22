import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { ArrowRight, CheckCircle2, Apple, Flame, Target } from "lucide-react";
import { Layout, PremiumButton } from "@/components/layout";

export default function Home() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="relative overflow-hidden w-full flex-1 flex flex-col">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 flex-1">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Sua saúde em primeiro lugar
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
              A dieta perfeita,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                feita para você.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Calcule sua taxa metabólica, defina seus objetivos e receba um plano alimentar completo, balanceado e com alimentos reais. Tudo de forma automática.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isLoading ? (
                <PremiumButton isLoading className="w-full sm:w-auto">Carregando...</PremiumButton>
              ) : isAuthenticated ? (
                <PremiumButton onClick={() => setLocation('/plan')} className="w-full sm:w-auto text-lg px-8">
                  Ver Meu Plano
                  <ArrowRight className="w-5 h-5" />
                </PremiumButton>
              ) : (
                <PremiumButton onClick={login} className="w-full sm:w-auto text-lg px-8">
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </PremiumButton>
              )}
              
              {!isAuthenticated && !isLoading && (
                <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  100% Gratuito
                </p>
              )}
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border/60">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Cálculo Preciso</h3>
                <p className="text-sm text-muted-foreground text-center lg:text-left">Usamos a fórmula Mifflin-St Jeor para exatidão.</p>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Foco no Objetivo</h3>
                <p className="text-sm text-muted-foreground text-center lg:text-left">Perda de peso, manutenção ou hipertrofia.</p>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Apple className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Comida de Verdade</h3>
                <p className="text-sm text-muted-foreground text-center lg:text-left">Refeições com alimentos acessíveis e nutritivos.</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full relative z-10 hidden md:block"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white/50 bg-white/20 backdrop-blur-sm aspect-square md:aspect-[4/3] lg:aspect-[3/4]">
              <img 
                src={`${import.meta.env.BASE_URL}images/hero-healthy.png`} 
                alt="Healthy fresh food" 
                className="w-full h-full object-cover rounded-xl"
              />
              
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 -left-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                  🥗
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Meta Diária</p>
                  <p className="text-lg font-bold text-foreground">1.850 kcal</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl border border-border flex items-center gap-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-right">Proteína</p>
                  <p className="text-lg font-bold text-foreground text-right">145g</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  🥩
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
