import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
import EpictusChatInterface from "./EpictusChatInterface";
import ChatEpictus from "./ChatEpictus";
import {
  Brain,
  BookOpen,
  BarChart3,
  MessageSquare,
  FileText,
  Search,
  Settings,
  Sparkles,
  Send,
  Zap,
  Star,
  PlusCircle,
  Clock,
  ChevronRight,
  Lightbulb,
  Compass,
  ArrowRight,
  Rocket,
  Code,
  Globe,
  Sparkle,
} from "lucide-react";

export default function EpictusIAInterface() {
  const { theme } = useTheme();
  // Obter o parâmetro de URL 'tab' se existir
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "conversation");
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(true);

  // Mini-seções - ativar ou desativar
  const [showMiniChat, setShowMiniChat] = useState(false);

  // Atualizar a URL quando a aba mudar
  const updateTab = (tab: string) => {
    setActiveTab(tab);
    // Verificar se tab é chat-epictus ou conversation para definir showChat
    if (tab === 'chat-epictus' || tab === 'conversation') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }

    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  // Alternar mini-seção de chat
  const toggleMiniChat = () => {
    setShowMiniChat(!showMiniChat);
  };

  return (
    <div
      className={`w-full h-full ${theme === "dark" ? "bg-[#001427]" : "bg-[#f7f9fa]"} flex flex-col transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-gray-800 bg-[#0A2540]" : "border-gray-200 bg-white"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} flex items-center gap-2`}
            >
              Epictus IA
              <Badge className="bg-[#FF6B00] text-white text-xs">Online</Badge>
            </h2>
            <p
              className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
            >
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className={`${theme === "dark" ? "text-white/60 hover:text-white hover:bg-[#29335C]/20" : "text-[#64748B] hover:text-[#29335C] hover:bg-gray-100"}`}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Panel */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div
              className={`border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"} p-2`}
            >
              <TabsList
                className={`${theme === "dark" ? "bg-[#29335C]/20" : "bg-gray-100"} p-1`}
              >
                <TabsTrigger
                  value="visao-geral"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("visao-geral")}
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="conversation"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("conversation")}
                >
                  Conversação
                </TabsTrigger>
                <TabsTrigger
                  value="chat-epictus"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("chat-epictus")}
                >
                  Chat Epictus
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("plano-estudos")}
                >
                  Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("resumos")}
                >
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("desempenho")}
                >
                  Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("modo-exploracao")}
                >
                  Modo Exploração
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="conversation" className="h-full mt-0 flex-1 flex flex-col">
                <EpictusChatInterface />
              </TabsContent>

              <TabsContent value="chat-epictus" className="h-full mt-0 flex-1 flex flex-col">
                <ChatEpictus />
              </TabsContent>

              <TabsContent value="visao-geral" className="mt-0 p-6 space-y-6">
              <VisaoGeralContent theme={theme} />
            </TabsContent>

              <TabsContent value="plano-estudos" className="mt-0">
                <PlanoEstudosInterface />
              </TabsContent>

              <TabsContent value="resumos" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Resumos Inteligentes
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Gere resumos inteligentes de qualquer conteúdo para estudar
                    de forma mais eficiente
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Criar Resumo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="desempenho" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Análise de Desempenho
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Acompanhe seu progresso e identifique áreas para melhorar
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Ver Análises
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="modo-exploracao" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <Compass className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Modo Exploração
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Explore temas de forma guiada com o Epictus IA
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Iniciar Exploração
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
}