import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { 
  useGetDietProfile, 
  useSaveDietProfile,
  type DietProfileInput 
} from "@workspace/api-client-react";
import { Layout, PremiumButton } from "@/components/layout";
import { Loader2, ArrowRight, User, Activity, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Matches DietProfileInput schema from api.schemas.ts
const profileSchema = z.object({
  age: z.coerce.number().min(10, "Idade deve ser maior que 10").max(120, "Idade inválida"),
  gender: z.enum(["male", "female"], { required_error: "Selecione o gênero" }),
  weightKg: z.coerce.number().min(30, "Peso inválido").max(300, "Peso inválido"),
  heightCm: z.coerce.number().min(100, "Altura inválida").max(250, "Altura inválida"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], { required_error: "Selecione o nível de atividade" }),
  goal: z.enum(["lose", "maintain", "gain"], { required_error: "Selecione o objetivo" }),
  restrictions: z.string().optional().nullable(),
});

export default function Profile() {
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: profileData, isLoading: isProfileLoading } = useGetDietProfile({
    query: {
      enabled: isAuthenticated,
      retry: false
    }
  });

  const { mutate: saveProfile, isPending: isSaving } = useSaveDietProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weightKg: undefined,
      heightCm: undefined,
      activityLevel: "moderate",
      goal: "lose",
      restrictions: "",
    }
  });

  // Prefill form if profile exists
  useEffect(() => {
    if (profileData?.profile) {
      form.reset({
        age: profileData.profile.age,
        gender: profileData.profile.gender as any,
        weightKg: profileData.profile.weightKg,
        heightCm: profileData.profile.heightCm,
        activityLevel: profileData.profile.activityLevel as any,
        goal: profileData.profile.goal as any,
        restrictions: profileData.profile.restrictions || "",
      });
    }
  }, [profileData, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    saveProfile({ data: data as DietProfileInput }, {
      onSuccess: () => {
        toast({
          title: "Perfil salvo com sucesso!",
          description: "Seu plano de dieta foi atualizado.",
          variant: "default",
        });
        setLocation('/plan');
      },
      onError: (err) => {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar seu perfil. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  // Auth Protection
  if (isAuthLoading || (isAuthenticated && isProfileLoading)) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
            <p className="text-muted-foreground mb-8">Faça login para criar ou acessar seu perfil de dieta personalizado.</p>
            <PremiumButton onClick={login} className="w-full">
              Fazer Login <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Background Image Header */}
        <div className="absolute top-0 left-0 w-full h-64 -z-10 overflow-hidden">
          <img 
            src={`${import.meta.env.BASE_URL}images/abstract-green.png`} 
            alt="" 
            className="w-full h-full object-cover opacity-60 dark:opacity-30 mask-image:linear-gradient(to_bottom,white,transparent)"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Seu Perfil</h1>
          <p className="text-muted-foreground text-lg mt-2">Precisamos de alguns dados para calcular suas necessidades com precisão.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-[2rem] shadow-xl shadow-black/5 border border-border/60 p-6 md:p-10 mb-12"
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Sec 1: Basic Info */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-foreground border-b border-border pb-2">
                <User className="w-5 h-5 text-primary" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Idade</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 30"
                    {...form.register("age")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none",
                      form.formState.errors.age ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  />
                  {form.formState.errors.age && <p className="text-sm text-destructive ml-1">{form.formState.errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Gênero Biológico</label>
                  <select 
                    {...form.register("gender")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none appearance-none",
                      form.formState.errors.gender ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  >
                    <option value="">Selecione...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                  {form.formState.errors.gender && <p className="text-sm text-destructive ml-1">{form.formState.errors.gender.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 75.5"
                    {...form.register("weightKg")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none",
                      form.formState.errors.weightKg ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  />
                  {form.formState.errors.weightKg && <p className="text-sm text-destructive ml-1">{form.formState.errors.weightKg.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Altura (cm)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 175"
                    {...form.register("heightCm")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none",
                      form.formState.errors.heightCm ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  />
                  {form.formState.errors.heightCm && <p className="text-sm text-destructive ml-1">{form.formState.errors.heightCm.message}</p>}
                </div>
              </div>
            </div>

            {/* Sec 2: Activity & Goals */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-foreground border-b border-border pb-2">
                <Activity className="w-5 h-5 text-primary" />
                Estilo de Vida e Objetivos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Nível de Atividade Física</label>
                  <select 
                    {...form.register("activityLevel")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none appearance-none",
                      form.formState.errors.activityLevel ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  >
                    <option value="sedentary">Sedentário (Pouco ou nenhum exercício)</option>
                    <option value="light">Levemente Ativo (Exercício leve 1-3 dias/semana)</option>
                    <option value="moderate">Moderadamente Ativo (Exercício moderado 3-5 dias/semana)</option>
                    <option value="active">Muito Ativo (Exercício intenso 6-7 dias/semana)</option>
                    <option value="very_active">Extremamente Ativo (Atleta/Trabalho físico pesado)</option>
                  </select>
                  {form.formState.errors.activityLevel && <p className="text-sm text-destructive ml-1">{form.formState.errors.activityLevel.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Objetivo Principal</label>
                  <select 
                    {...form.register("goal")}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl bg-background border-2 transition-all outline-none appearance-none",
                      form.formState.errors.goal ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80"
                    )}
                  >
                    <option value="lose">Perder Peso (Déficit Calórico)</option>
                    <option value="maintain">Manter Peso (Manutenção)</option>
                    <option value="gain">Ganhar Massa (Superávit Calórico)</option>
                  </select>
                  {form.formState.errors.goal && <p className="text-sm text-destructive ml-1">{form.formState.errors.goal.message}</p>}
                </div>
              </div>
            </div>

            {/* Sec 3: Extra */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-foreground border-b border-border pb-2">
                <Target className="w-5 h-5 text-primary" />
                Preferências
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Restrições Alimentares (Opcional)</label>
                <textarea 
                  placeholder="Ex: Vegetariano, intolerante a lactose, não gosto de peixe..."
                  {...form.register("restrictions")}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-border/80 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <PremiumButton type="submit" isLoading={isSaving} className="w-full sm:w-auto px-10">
                Gerar Plano de Dieta
              </PremiumButton>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
