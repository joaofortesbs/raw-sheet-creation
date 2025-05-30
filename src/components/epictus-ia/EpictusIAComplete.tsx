import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import SectionCard from "@/components/epictus-ia/components/SectionCard";
import SectionContent from "@/components/epictus-ia/components/SectionContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInteligente, CriarConteudo, AprenderMaisRapido, AnalisarCorrigir, OrganizarOtimizar, FerramentasExtras } from "@/components/epictus-ia/sections";
import {
  Brain,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Moon,
  Sun,
  Languages,
  MessageSquare,
  BookOpen,
  PenTool,
  FileText,
  BarChart3,
  Calendar,
  Wrench, // Replacing Tool with Wrench
  PlusCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  BrainCircuit,
} from "lucide-react";
import EpictusIAHeader from "./EpictusIAHeader"; // Added import for the new header component
import EpictusTurboMode from "./EpictusTurboMode"; // Added import for EpictusTurboMode


// Definição das abas/seções
const sections = [
  {
    id: "chat-inteligente",
    name: "Chat Inteligente",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-400",
    component: ChatInteligente,
    badge: "Popular",
    description: "Converse com diferentes assistentes de IA especializados"
  },
  {
    id: "criar-conteudo",
    name: "Criar Conteúdo",
    icon: <PenTool className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-400",
    component: CriarConteudo,
    badge: "Novo",
    description: "Ferramentas para criar materiais e conteúdos didáticos"
  },
  {
    id: "aprender-mais-rapido",
    name: "Aprender Mais Rápido",
    icon: <Zap className="h-6 w-6" />,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-400",
    component: AprenderMaisRapido,
    badge: null,
    description: "Resumos, mapas mentais e métodos para aprendizado eficiente"
  },
  {
    id: "analisar-corrigir",
    name: "Analisar e Corrigir",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-purple-500 to-violet-600",
    borderColor: "border-purple-400",
    component: AnalisarCorrigir,
    badge: "Beta",
    description: "Ferramentas para análise de desempenho e correções"
  },
  {
    id: "organizar-otimizar",
    name: "Organizar e Otimizar",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-red-500 to-pink-600",
    borderColor: "border-red-400",
    component: OrganizarOtimizar,
    badge: null,
    description: "Planejadores, cronogramas e ferramentas de organização"
  },
  {
    id: "ferramentas-extras",
    name: "Ferramentas Extras",
    icon: <Wrench className="h-6 w-6" />, // Changed from Tool to Wrench
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-400",
    component: FerramentasExtras,
    badge: "Experimental",
    description: "Outras ferramentas especializadas para diversos fins"
  }
];

export default function EpictusIAComplete() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("chat-inteligente");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSections, setFilteredSections] = useState(sections);
  const [turboModeActive, setTurboModeActive] = useState(false);
  const [turboAdvancedModeActive, setTurboAdvancedModeActive] = useState(false);


  const carouselRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Efeito para quando a busca é ativada, foca no input
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Atualiza o índice do carrossel quando a seção ativa muda
  useEffect(() => {
    const index = sections.findIndex(section => section.id === activeSection);
    if (index !== -1) {
      setCarouselIndex(index);
    }
  }, [activeSection]);

  // Filtra as seções com base na busca
  useEffect(() => {
    if (searchQuery) {
      const filtered = sections.filter(section =>
        section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [searchQuery]);

  // Avança no carrossel com transição suave para loop infinito
  const nextSection = () => {
    const newIndex = carouselIndex < sections.length - 1 ? carouselIndex + 1 : 0;
    setCarouselIndex(newIndex);
    setActiveSection(sections[newIndex].id);
  };

  // Volta no carrossel com transição suave para loop infinito
  const prevSection = () => {
    const newIndex = carouselIndex > 0 ? carouselIndex - 1 : sections.length - 1;
    setCarouselIndex(newIndex);
    setActiveSection(sections[newIndex].id);
  };

  // Seleciona uma seção específica
  const selectSection = (index: number) => {
    setCarouselIndex(index);
    setActiveSection(sections[index].id);
  };

  // Fecha o painel de busca ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Verificar se o parâmetro de URL mode=turbo ou mode=turbo-advanced está presente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "turbo") {
      setTurboModeActive(true);
    } else if (mode === "turbo-advanced") {
      setTurboAdvancedModeActive(true);
    }

    // Adicionando listener para ativar o modo turbo
    const handleTurboActivation = () => {
      setTurboModeActive(true);
      setTurboAdvancedModeActive(false);
    };

    // Adicionando listener para ativar o modo turbo advanced
    const handleTurboAdvancedActivation = () => {
      setTurboAdvancedModeActive(true);
      setTurboModeActive(false);
    };

    window.addEventListener('activateTurboMode', handleTurboActivation);
    window.addEventListener('activateTurboAdvancedMode', handleTurboAdvancedActivation);

    return () => {
      window.removeEventListener('activateTurboMode', handleTurboActivation);
      window.removeEventListener('activateTurboAdvancedMode', handleTurboAdvancedActivation);
    };
  }, []);

  return (
    <div className={`w-full flex flex-col ${theme === "dark" ? "bg-[#001427]" : "bg-gray-50"} transition-colors duration-300 overflow-y-auto min-h-screen`}>
      {turboModeActive ? (
        <EpictusTurboMode />
      ) : turboAdvancedModeActive ? (
        <EpictusTurboAdvancedMode />
      ) : (
        <>
          <div className="p-4"> {/* This is where the new header is inserted */}
            <EpictusIAHeader />
          </div>
          {/* Carrossel 3D de seleção de seções */}
          <div className="relative py-10 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                onClick={prevSection}
              >
                <ChevronLeft className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              </Button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                onClick={nextSection}
              >
                <ChevronRight className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              </Button>
            </div>

            <motion.div
              ref={carouselRef}
              className="flex items-center justify-center h-[240px]"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -500) {
                  nextSection();
                } else if (offset.x > 50 || velocity.x > 500) {
                  prevSection();
                }
              }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-center relative">
                {sections.map((section, index) => {
                  // Calcular a posição relativa ao item ativo com lógica de rolagem infinita
                  let position = index - carouselIndex;

                  // Ajustar posição para criar efeito de rolagem infinita
                  if (Math.abs(position) > sections.length / 2) {
                    position = position - Math.sign(position) * sections.length;
                  }

                  return (
                    <motion.div
                      key={section.id}
                      className={`absolute select-none cursor-pointer`}
                      animate={{
                        scale: position === 0 ? 1 : 0.85 - Math.min(Math.abs(position) * 0.1, 0.3),
                        x: position * 200,
                        opacity: Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3,
                        zIndex: 10 - Math.abs(position),
                        rotateY: position * 10,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onClick={() => selectSection(index)}
                    >
                      <div
                        className={cn(
                          `w-64 rounded-xl overflow-hidden border-2 transform transition-all group`,
                          position === 0 ? `shadow-lg ${section.borderColor}` : 'border-transparent',
                          theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
                        )}
                        style={{
                          backdropFilter: "blur(8px)",
                          perspective: "1000px",
                          height: position === 0 ? "200px" : "180px",
                          minHeight: position === 0 ? "200px" : "180px"
                        }}
                      >
                        <div className={`h-full p-5 flex flex-col justify-between relative overflow-hidden`}>
                          {/* Efeito de brilho quando é o item ativo */}
                          {position === 0 && (
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute -inset-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 rotate-45 translate-x-[-120%] group-hover:translate-x-[120%] duration-1500 transition-all ease-in-out"></div>
                            </div>
                          )}

                          <div className="flex justify-between items-start">
                            <div
                              className={`w-12 h-12 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center`}
                            >
                              {section.icon}
                            </div>

                            {section.badge && (
                              <Badge
                                className={`bg-white/90 text-xs font-medium animate-pulse ${
                                  section.badge === "Novo"
                                    ? "text-emerald-600"
                                    : section.badge === "Beta"
                                    ? "text-purple-600"
                                    : section.badge === "Popular"
                                    ? "text-blue-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {section.badge}
                              </Badge>
                            )}
                          </div>

                          <div>
                            <h3 className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {section.name}
                            </h3>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} line-clamp-3`}>
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Indicadores (bolinhas) para o carrossel */}
            <div className="flex justify-center mt-6 gap-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === carouselIndex
                      ? "w-6 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50]"
                      : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`}
                  onClick={() => selectSection(index)}
                />
              ))}
            </div>
          </div>

          {/* Conteúdo da seção ativa */}
          <div className="flex-1 px-6 pb-12 overflow-y-visible">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Tabs value={activeSection} onValueChange={setActiveSection} className="h-full">
                <TabsContent value="chat-inteligente" className="mt-0 h-full">
                  <ChatInteligente />
                </TabsContent>
                <TabsContent value="criar-conteudo" className="mt-0 h-full">
                  <CriarConteudo />
                </TabsContent>
                <TabsContent value="aprender-mais-rapido" className="mt-0 h-full">
                  <AprenderMaisRapido />
                </TabsContent>
                <TabsContent value="analisar-corrigir" className="mt-0 h-full">
                  <AnalisarCorrigir />
                </TabsContent>
                <TabsContent value="organizar-otimizar" className="mt-0 h-full">
                  <OrganizarOtimizar />
                </TabsContent>
                <TabsContent value="ferramentas-extras" className="mt-0 h-full">
                  <FerramentasExtras />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}