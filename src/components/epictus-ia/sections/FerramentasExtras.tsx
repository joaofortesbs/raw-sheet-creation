
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  SectionHeader, 
  SuggestionCard,
  CalculadoraFormulasCard,
  ExtratorTextoCard,
  GeradorIdeiasCard,
  TradutorAvancadoCard,
  Visualizador3DCard,
  ConversorUnidadesCard
} from "./components/ferramentas-extras";

export default function FerramentasExtras() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        title="Ferramentas Extras" 
        description="Conjunto de ferramentas auxiliares para tornar seu aprendizado ainda mais completo"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CalculadoraFormulasCard />
        <ExtratorTextoCard />
        <GeradorIdeiasCard />
        <TradutorAvancadoCard />
        <Visualizador3DCard />
        <ConversorUnidadesCard />
      </div>

      <div className="mt-6 flex-1">
        <SuggestionCard />
      </div>
    </div>
  );
}
