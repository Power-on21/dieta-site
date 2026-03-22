import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetDietPlan, type Meal } from "@workspace/api-client-react";
import { Layout, PremiumButton } from "@/components/layout";
import { Loader2, Flame, Target, AlertCircle, ArrowRight, Utensils, Droplet, Wheat, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Plan() {
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [, setLocation] = useLocation();

  const { data, isLoading: isPlanLoading, error } = useGetDietPlan({
    query: {
      enabled: isAuthenticated,
      retry: false
    }
  });

  if (isAuthLoading || (isAuthenticated && isPlanLoading)) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Preparando seu cardápio...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card p-8 rounded-3xl shadow-xl border border-border max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-8">Faça login para ver seu plano alimentar.</p>
            <PremiumButton onClick={login} className="w-full">
              Fazer Login <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card p-8 rounded-3xl shadow-xl border border-border max-w-md w-full text-center">
            <Target className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Perfil Incompleto</h2>
            <p className="text-muted-foreground mb-8">Você precisa preencher seus dados corporais para gerarmos sua dieta.</p>
            <PremiumButton onClick={() => setLocation('/profile')} className="w-full">
              Criar Meu Perfil <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      </Layout>
    );
  }

  const { plan, profile } = data;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight">Plano Alimentar</h1>
            <p className="text-muted-foreground text-lg mt-2">Baseado no seu objetivo de 
              <span className="font-semibold text-primary ml-1">
                {profile.goal === 'lose' ? 'Perder Peso' : profile.goal === 'gain' ? 'Ganhar Massa' : 'Manter Peso'}
              </span>
            </p>
          </div>
          <PremiumButton variant="outline" onClick={() => setLocation('/profile')} className="md:w-auto w-full">
            <Edit3 className="w-4 h-4" />
            Editar Perfil
          </PremiumButton>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <motion.div initial="hidden" animate="show" variants={item} className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Flame className="w-24 h-24" /></div>
            <div className="relative z-10">
              <p className="text-emerald-100 font-semibold mb-1 uppercase tracking-wider text-sm">Meta Diária</p>
              <h2 className="text-5xl font-display font-bold mb-2">{plan.totalCalories.toFixed(0)} <span className="text-2xl font-normal opacity-80">kcal</span></h2>
              <div className="flex gap-4 mt-6 text-sm bg-black/10 rounded-xl p-3 inline-flex backdrop-blur-md border border-white/10">
                <div>
                  <span className="opacity-70 block text-xs">TMB</span>
                  <span className="font-bold">{profile.tmb.toFixed(0)}</span>
                </div>
                <div className="w-[1px] bg-white/20"></div>
                <div>
                  <span className="opacity-70 block text-xs">Gasto Total</span>
                  <span className="font-bold">{profile.tdee.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Macros */}
          <motion.div initial="hidden" animate="show" variants={item} className="bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded-md">30%</span>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-sm mb-1 uppercase tracking-wider">Proteínas</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{plan.totalProtein.toFixed(0)}<span className="text-lg text-muted-foreground ml-1">g</span></h3>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={item} className="bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Wheat className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/20 px-2 py-1 rounded-md">45%</span>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-sm mb-1 uppercase tracking-wider">Carboidratos</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{plan.totalCarbs.toFixed(0)}<span className="text-lg text-muted-foreground ml-1">g</span></h3>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={item} className="bg-card rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50 flex flex-col justify-between group hover:border-rose-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-500/20 px-2 py-1 rounded-md">25%</span>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-sm mb-1 uppercase tracking-wider">Gorduras</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{plan.totalFat.toFixed(0)}<span className="text-lg text-muted-foreground ml-1">g</span></h3>
            </div>
          </motion.div>

        </div>

        {/* Meals Timeline */}
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-primary" /> 
          Suas Refeições
        </h2>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {plan.meals.map((meal: Meal, index: number) => (
            <motion.div 
              key={index} 
              variants={item}
              className="bg-card rounded-[2rem] p-6 sm:p-8 shadow-lg shadow-black/5 border border-border/60 flex flex-col md:flex-row gap-6 lg:gap-10 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              
              {/* Meal Header (Left Col) */}
              <div className="md:w-1/3 shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
                <div>
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm mb-4">
                    {meal.time}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">{meal.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-6">
                    {meal.calories.toFixed(0)} <span className="text-base font-normal text-muted-foreground">kcal</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-background rounded-xl p-3 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Prot</p>
                    <p className="font-semibold text-foreground">{meal.protein.toFixed(0)}g</p>
                  </div>
                  <div className="flex-1 bg-background rounded-xl p-3 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Carb</p>
                    <p className="font-semibold text-foreground">{meal.carbs.toFixed(0)}g</p>
                  </div>
                  <div className="flex-1 bg-background rounded-xl p-3 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Gord</p>
                    <p className="font-semibold text-foreground">{meal.fat.toFixed(0)}g</p>
                  </div>
                </div>
              </div>

              {/* Foods List (Right Col) */}
              <div className="md:w-2/3 flex flex-col justify-center">
                <ul className="space-y-4">
                  {meal.foods.map((food, fIdx) => (
                    <li key={fIdx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-150 transition-all"></div>
                        <span className="font-medium text-foreground text-lg">{food.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="font-semibold bg-secondary text-secondary-foreground px-3 py-1 rounded-lg">{food.quantity}</span>
                        <span className="text-sm text-muted-foreground w-16 hidden sm:inline-block">{food.calories.toFixed(0)} kcal</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </Layout>
  );
}
