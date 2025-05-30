import React, { useState } from "react";
import { GroupDetailProps } from "./types";
import { DiscussoesTab } from "./tabs/DiscussoesTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";
import GroupDetailHeader from "./GroupDetailHeader";
import {
  MessageCircle,
  FileText,
  Users,
  Calendar,
  Info,
  Search,
  Plus,
  FileUp,
  Folder,
  Download,
  MoreVertical,
  Clock,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { members, files, events, topics, tools } from "./data/mockData";

export const GroupDetail: React.FC<GroupDetailProps> = ({ group, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discussoes");
  const { theme } = useTheme();

  const handleViewMembers = () => {
    setActiveTab("membros");
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#0f1525] text-gray-900 dark:text-white p-0 overflow-hidden flex flex-col">
      {/* Fixed Header with Cover Image */}
      <GroupDetailHeader
        group={group}
        onBack={onBack}
        onViewMembers={handleViewMembers}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tabs Content - Below the fixed cover */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-grow flex flex-col"
      >
        {/* Discussões Tab */}
        <TabsContent
          value="discussoes"
          className="p-0 mt-0 flex-grow overflow-hidden"
        >
          <DiscussoesTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            groupName={group.nome || "Mecânica Quântica Avançada"}
            group={group}
          />
        </TabsContent>

        {/* Arquivos Tab */}
        <TabsContent
          value="arquivos"
          className="p-4 mt-0 flex-grow overflow-auto"
        >
          <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Arquivos do Grupo</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar arquivos..."
                    className="pl-10 bg-white dark:bg-[#0f1525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-64 rounded-full"
                  />
                </div>
                <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                  <FileUp className="h-4 w-4 mr-2" /> Adicionar arquivo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col">
                  <h4 className="font-bold mb-2">Massas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                      <span className="text-sm">Material de Aula</span>
                      <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                        3
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                      <span className="text-sm">Exercícios</span>
                      <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                        2
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Folder className="h-4 w-4 mr-2 text-[#FF6B00]" />
                      <span className="text-sm">Referências</span>
                      <Badge className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                        2
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                      avançado
                    </Badge>
                    <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                      teórico
                    </Badge>
                    <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                      prático
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white dark:bg-[#0f1525] p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                    >
                      <div className="p-2 bg-[#FF6B00]/10 rounded-lg mr-3">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{file.name}</h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>{file.size}</span>
                          <span className="mx-2">•</span>
                          <span>Enviado por {file.uploadedBy}</span>
                          <span className="mx-2">•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Membros Tab */}
        <TabsContent
          value="membros"
          className="p-4 mt-0 flex-grow overflow-auto"
        >
          <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Membros do Grupo</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar membros..."
                    className="pl-10 bg-white dark:bg-[#0f1525] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-64 rounded-full"
                  />
                </div>
                <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                  <UserPlus className="h-4 w-4 mr-2" /> Adicionar membro
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="relative mr-3">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-[#0f1525]"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{member.name}</h4>
                      {member.role === "Administrador" && (
                        <Badge className="ml-2 bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
                          Administrador
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {member.isOnline ? (
                        <span className="flex items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {member.lastActive}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Eventos Tab */}
        <TabsContent
          value="eventos"
          className="p-4 mt-0 flex-grow overflow-auto"
        >
          <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Eventos do Grupo</h3>
              <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white transition-colors">
                <Plus className="h-4 w-4 mr-2" /> Criar evento
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="bg-white dark:bg-[#0f1525] rounded-lg p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                  <h4 className="font-bold mb-3">Março 2023</h4>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    <div className="text-xs text-gray-500">D</div>
                    <div className="text-xs text-gray-500">S</div>
                    <div className="text-xs text-gray-500">T</div>
                    <div className="text-xs text-gray-500">Q</div>
                    <div className="text-xs text-gray-500">Q</div>
                    <div className="text-xs text-gray-500">S</div>
                    <div className="text-xs text-gray-500">S</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const isToday = day === 15;
                      const hasEvent = [15, 19].includes(day);
                      return (
                        <div
                          key={day}
                          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm ${isToday ? "bg-[#FF6B00] text-white" : hasEvent ? "text-[#FF6B00] font-medium" : "text-gray-500 dark:text-gray-400"} ${hasEvent ? "cursor-pointer hover:bg-[#FF6B00]/10" : ""}`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <h4 className="font-bold mb-3">Próximo evento</h4>
                    <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h5 className="font-medium">Encontro do Grupo</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Discussão sobre os últimos tópicos e resolução de
                        exercícios.
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                        <span>15 de mar, 19:00-20:30</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" />
                            <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                          <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" />
                            <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                          <Avatar className="h-6 w-6 border-2 border-white dark:border-[#1a2236]">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" />
                            <AvatarFallback>M</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex gap-1">
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                            Vou
                          </Badge>
                          <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                            Talvez
                          </Badge>
                          <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                            Não vou
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors shadow-sm hover:shadow-md"
                    >
                      <div className="flex">
                        <div className="mr-4 text-center">
                          <div className="bg-[#FF6B00]/10 text-[#FF6B00] font-bold text-xl rounded-t-lg px-3 py-1">
                            {event.date.split("/")[0]}
                          </div>
                          <div className="bg-gray-100 dark:bg-[#1a2236] text-gray-500 dark:text-gray-400 text-xs rounded-b-lg px-2 py-1">
                            março
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{event.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <Clock className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                            <span>{event.time}</span>
                            <span className="mx-2">•</span>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex -space-x-2 mr-2">
                                {event.participants
                                  .slice(0, 3)
                                  .map((participantId) => {
                                    const participant = members.find(
                                      (m) => m.id === participantId,
                                    );
                                    return (
                                      <Avatar
                                        key={participantId}
                                        className="h-6 w-6 border-2 border-white dark:border-[#0f1525]"
                                      >
                                        <AvatarImage
                                          src={participant?.avatar}
                                        />
                                        <AvatarFallback>
                                          {participant?.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    );
                                  })}
                                {event.participants.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-[#0f1525] flex items-center justify-center text-xs text-gray-700 dark:text-white">
                                    +{event.participants.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {event.participants.length} participantes
                              </span>
                            </div>
                            <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8 transition-colors">
                              Participar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Sobre Tab */}
        <TabsContent value="sobre" className="p-4 mt-0 flex-grow overflow-auto">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold mb-3">Sobre o Grupo</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {group.descricao ||
                    "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica."}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Este grupo foi criado para facilitar o estudo colaborativo e o
                  compartilhamento de recursos entre os alunos interessados em
                  mecânica quântica.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold mb-3">Tópicos de Estudo</h3>
                <div className="grid grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="bg-gray-50 dark:bg-[#0f1525] p-3 rounded-lg border border-[#FF6B00]/30 hover:shadow-md transition-all"
                    >
                      <h4 className="font-bold text-[#FF6B00]">
                        {topic.title}
                      </h4>
                      <Button
                        variant="link"
                        className="text-xs text-[#FF6B00] p-0 h-auto"
                      >
                        Ver recursos relacionados
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Ferramentas e Recursos</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f1525] transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="bg-gray-50 dark:bg-[#0f1525] p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center hover:shadow-md transition-all"
                    >
                      <div
                        className={`h-12 w-12 rounded-full bg-${tool.color}-100 dark:bg-${tool.color}-500/20 flex items-center justify-center mb-2`}
                      >
                        {tool.icon === "whiteboard" && (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 2H3C2.4 2 2 2.4 2 3V17C2 17.6 2.4 18 3 18H10V20H8V22H16V20H14V18H21C21.6 18 22 17.6 22 17V3C22 2.4 21.6 2 21 2ZM20 16H4V4H20V16Z"
                              fill="#10B981"
                            />
                          </svg>
                        )}
                        {tool.icon === "code" && (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
                              fill="#3B82F6"
                            />
                          </svg>
                        )}
                        {tool.icon === "formula" && (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 2H17L13.5 7H17L10 16V9H7V2ZM9 4V7H10V10.31L12 7.5H9.5L13 2.5H8V4H9ZM3 20H21V22H3V20Z"
                              fill="#8B5CF6"
                            />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-bold mb-1">{tool.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold mb-3">Detalhes do Grupo</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Criado em
                    </p>
                    <p className="font-medium">
                      {group.dataInicio || "10/02/2023"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nível
                    </p>
                    <p className="font-medium">{group.nivel || "Avançado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Membros
                    </p>
                    <p className="font-medium">
                      {group.membros?.length || members.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Próxima reunião
                    </p>
                    <p className="font-medium">
                      {group.proximaReuniao || "15/03/2023, 19:00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2236] rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold mb-3">Administradores</h3>
                <div className="space-y-3">
                  {members
                    .filter((m) => m.role === "Administrador")
                    .map((admin) => (
                      <div key={admin.id} className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={admin.avatar} />
                          <AvatarFallback>
                            {admin.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {admin.isOnline ? "Online" : admin.lastActive}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetail;
