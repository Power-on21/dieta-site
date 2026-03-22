import { Link } from "wouter";
import { Layout, PremiumButton } from "@/components/layout";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center text-primary mx-auto mb-8 rotate-12">
            <Leaf className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Página não encontrada. Parece que você se perdeu do cardápio.</p>
          <Link href="/">
            <PremiumButton className="w-full sm:w-auto">
              Voltar ao Início
            </PremiumButton>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
