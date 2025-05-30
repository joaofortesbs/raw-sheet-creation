import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Components
import MonthView from "@/components/agenda/calendar-views/month-view";
import WeekView from "@/components/agenda/calendar-views/week-view";
import DayView from "@/components/agenda/calendar-views/day-view";
import EpictusAIWidget from "@/components/agenda/cards/epictus-ai-widget";
import EpictusAIAssistantModal from "@/components/agenda/modals/epictus-ai-assistant-modal";
import EpictusAISuggestionsModal from "@/components/agenda/modals/epictus-ai-suggestions-modal";
import EpictusCalendar from "@/components/agenda/cards/epictus-calendar";
import AIMentor from "@/components/agenda/cards/ai-mentor";
import UpcomingEvents from "@/components/agenda/cards/upcoming-events";
import FlowView from "@/components/agenda/flow/FlowView";
import AddEventModal from "@/components/agenda/modals/add-event-modal";
import AddTaskModal from "@/components/agenda/modals/add-task-modal";
import EventDetailsModal from "@/components/agenda/modals/event-details-modal";
import TasksView from "@/components/agenda/tasks/TasksView";
import ChallengesView from "@/components/agenda/challenges/ChallengesView";
import MetricsGrid from "@/components/agenda/metrics/MetricsGrid";
import ManagementGrid from "@/components/agenda/management/ManagementGrid";

// Icons
import {
  Calendar as CalendarIcon,
  Home,
  CheckSquare,
  Bell,
  Target,
  Search,
  Plus,
  Video,
  FileEdit,
  AlertCircle,
  Users,
  Moon,
  Sun,
  Smartphone,
  Brain,
  Clock,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Trophy,
  Star,
  LineChart,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Play,
  FileText,
  Flag,
  PieChart,
  Sparkles,
  Lightbulb,
  Flame,
  Award,
  Zap,
  Hourglass,
  Coins,
  ClipboardList,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Info,
  ChevronLeft,
} from "lucide-react";

export default function AgendaPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view") || "visao-geral";
  const [activeTab, setActiveTab] = useState(viewParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState("semana"); // semana, mes, ano
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showEpictusAIModal, setShowEpictusAIModal] = useState(false);
  const [showEpictusCalendarModal, setShowEpictusCalendarModal] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showSetGoalModal, setShowSetGoalModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAISuggestionsModal, setShowAISuggestionsModal] = useState(false);
  const [tasksData, setTasksData] = useState([
    {
      id: "1",
      title: "Lista de Exercícios - Funções Trigonométricas",
      discipline: "Matemática",
      dueDate: "Vence hoje, 18:00",
      progress: 75,
      urgent: true,
      priority: "alta",
    },
    {
      id: "2",
      title: "Relatório de Experimento - Titulação",
      discipline: "Química",
      dueDate: "Vence em 2 dias",
      progress: 30,
      urgent: false,
      priority: "média",
    },
    {
      id: "3",
      title: "Preparação para Prova - Mecânica Quântica",
      discipline: "Física",
      dueDate: "Vence em 1 dia",
      progress: 10,
      urgent: true,
      priority: "alta",
    },
  ]);

  // Get current date for calendar
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Update URL when active tab changes
  useEffect(() => {
    setSearchParams({ view: activeTab });
  }, [activeTab, setSearchParams]);

  // Update active tab when URL changes
  useEffect(() => {
    if (viewParam) {
      setActiveTab(viewParam);
    }
  }, [viewParam]);

  // Dados de eventos para o calendário (vazio por padrão)
  const [eventData, setEventData] = useState<Record<number, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar armazenamento local ao carregar a página
    const initStorage = async () => {
      try {
        const { initLocalStorage } = await import('@/services/calendarEventService');

        // Inicializar armazenamento local
        initLocalStorage();
        console.log("Armazenamento local inicializado");
      } catch (error) {
        console.error("Erro ao inicializar armazenamento local:", error);
      }
    };

    initStorage();
  }, []);

  // Efeito para carregar eventos quando a página é carregada
  useEffect(() => {
    // Carregar eventos do banco de dados quando a página é carregada
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        console.log("Carregando eventos para a página de agenda...");

        const { getCurrentUser } = await import('@/services/databaseService');
        const { getEventsByUserId, syncLocalEvents, getAllLocalEvents } = await import('@/services/calendarEventService');
        const { toast } = await import("@/components/ui/use-toast");

        let currentUser = null;

        try {
          currentUser = await getCurrentUser();
        } catch (userError) {
          console.warn("Erro ao obter usuário atual:", userError);
          // Continuar sem usuário
        }

        let events = [];

        if (currentUser?.id) {
          console.log("Usuário autenticado:", currentUser.id);

          // Primeiro sincronize eventos locais com o banco de dados
          await syncLocalEvents(currentUser.id);
          console.log("Sincronização de eventos locais concluída");

          // Depois busque todos os eventos do usuário
          events = await getEventsByUserId(currentUser.id);
          console.log("Eventos carregados do banco de dados:", events.length);
        } else {
          console.log("Usuário não autenticado, carregando eventos locais");

          // Se não houver usuário autenticado, use apenas eventos locais
          const { getAllLocalEvents } = await import('@/services/calendarEventService');
          events = getAllLocalEvents();
          console.log("Eventos carregados do armazenamento local:", events.length);
        }

        // Disparar evento de atualização global para outros componentes
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('agenda-events-updated'));
        }, 500);

        if (events.length === 0) {
          console.warn("Nenhum evento encontrado");
          setEventData({});
          setIsLoading(false);
          return;
        }

        // Converter eventos para o formato necessário para o calendário
        const formattedEvents: Record<number, any[]> = {};

        events.forEach(event => {
          try {
            const startDate = new Date(event.startDate);

            if (isNaN(startDate.getTime())) {
              console.warn("Data inválida para evento:", event);
              return; // Pular este evento
            }

            // Usar o dia do mês como chave para agrupar eventos do mesmo dia
            const day = startDate.getDate();

            if (!formattedEvents[day]) {
              formattedEvents[day] = [];
            }

            const formattedEvent = {
              id: event.id,
              title: event.title,
              description: event.description || "",
              type: event.type || "evento",
              startDate: event.startDate,
              startTime: event.startTime || "00:00",
              endTime: event.endTime || "23:59",
              start: startDate,
              end: event.endDate ? new Date(event.endDate) : startDate,
              location: event.location || "",
              isOnline: event.isOnline || false,
              meetingLink: event.meetingLink || "",
              discipline: event.discipline || "Geral",
              professor: event.professor || "",
              color: getEventColor(event.type || "evento"),
              status: "confirmado",
              userId: event.userId
            };

            formattedEvents[day].push(formattedEvent);
          } catch (eventError) {
            console.error("Erro ao processar evento:", event, eventError);
          }
        });

        console.log("Eventos formatados para visualização:", Object.keys(formattedEvents).length, "dias com eventos");
        setEventData(formattedEvents);

        // Compartilhar os eventos com outros componentes através do objeto window
        // Isso permite que os componentes day-view e week-view acessem os mesmos eventos
        window.agendaEventData = formattedEvents;

        // Força atualização dos componentes de visualização
        window.dispatchEvent(new CustomEvent('agenda-events-updated', { 
          detail: { events: formattedEvents }
        }));

        console.log("Eventos compartilhados globalmente para componentes de visualização");

        if (events.length > 0) {
          toast({
            title: "Agenda carregada",
            description: `${events.length} eventos carregados com sucesso.`,
            variant: "success"
          });
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);

        const { toast } = await import("@/components/ui/use-toast");
        toast({
          title: "Erro ao carregar eventos",
          description: "Tente recarregar a página.",
          variant: "destructive"
        });

        // Tentar carregar do localStorage diretamente como último recurso
        try {
          const eventsJson = localStorage.getItem("calendar_events");
          if (eventsJson) {
            const localEvents = JSON.parse(eventsJson);
            console.log("Tentando carregar eventos diretamente do localStorage:", localEvents.length);

            // Converter eventos locais para o formato do calendário
            const formattedLocalEvents: Record<number, any[]> = {};

            localEvents.forEach(event => {
              try {
                const startDate = new Date(event.startDate);
                const day = startDate.getDate();

                if (!formattedLocalEvents[day]) {
                  formattedLocalEvents[day] = [];
                }

                formattedLocalEvents[day].push({
                  ...event,
                  start: startDate,
                  end: event.endDate ? new Date(event.endDate) : startDate,
                  color: getEventColor(event.type || "evento"),
                  status: "confirmado"
                });
              } catch (eventError) {
                console.error("Erro ao processar evento local:", event, eventError);
              }
            });

            setEventData(formattedLocalEvents);

            // Compartilhar os eventos através do objeto window mesmo em caso de erro
            window.agendaEventData = formattedLocalEvents;
          }
        } catch (localError) {
          console.error("Erro ao carregar eventos do localStorage:", localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Função para formatar eventos próximos a partir do eventData
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza a data atual para comparação
    const upcoming: any[] = [];

    // Percorre todos os dias com eventos
    Object.keys(eventData).forEach(day => {
      const dayEvents = eventData[parseInt(day)] || [];

      // Para cada evento nesse dia
      dayEvents.forEach(event => {
        if (event.startDate) {
          const eventDate = new Date(event.startDate);
          eventDate.setHours(0, 0, 0, 0); // Normaliza a data do evento para comparação

          // Adiciona eventos que ocorrem hoje ou no futuro
          if (eventDate >= today) {
            // Formata a data com date-fns
            const formattedDate = format(eventDate, "dd/MM/yyyy", { locale: ptBR });

            upcoming.push({
              id: event.id,
              type: event.type,
              title: event.title,
              day: formattedDate,
              discipline: event.discipline || "Geral",
              isOnline: event.isOnline || false,
              color: event.color,
              details: event.details,
              startTime: event.startTime || event.time || "00:00",
              // Guardar a data original para ordenação
              originalDate: eventDate,
              originalTime: event.startTime || event.time || "00:00"
            });
          }
        }
      });
    });

    // Ordena eventos cronologicamente (por data e hora)
    upcoming.sort((a, b) => {
      // Primeiro compara por data
      const dateComparison = a.originalDate.getTime() - b.originalDate.getTime();

      // Se for a mesma data, compara pelo horário
      if (dateComparison === 0) {
        const [hoursA, minutesA] = a.originalTime.split(':').map(Number);
        const [hoursB, minutesB] = b.originalTime.split(':').map(Number);

        // Compara horas
        if (hoursA !== hoursB) {
          return hoursA - hoursB;
        }

        // Se as horas forem iguais, compara minutos
        return minutesA - minutesB;
      }

      return dateComparison;
    });

    return upcoming;
  };

  // Array de eventos próximos atualizado a partir do eventData
  const upcomingEventsData = getUpcomingEvents();

  // Sample AI recommendations
  const aiRecommendations = [
    {
      id: "1",
      priority: "high",
      title: "Prioridade Alta: Você tem uma prova de Física amanhã",
      description:
        "Recomendo revisar os conceitos de Mecânica Quântica hoje à noite.",
      actions: [
        {
          label: "Ver Material",
          icon: <FileText className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
        {
          label: "Criar Resumo",
          icon: <FileEdit className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
        },
      ],
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    {
      id: "2",
      priority: "medium",
      title: "Seu desempenho em Química caiu 15% na última semana",
      description: "Que tal revisar os conceitos de titulação?",
      actions: [
        {
          label: "Ver Desempenho",
          icon: <LineChart className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
        {
          label: "Praticar Exercícios",
          icon: <CheckSquare className="h-3.5 w-3.5 mr-1" />,
          variant: "default",
        },
      ],
      icon: <Flame className="h-5 w-5 text-amber-500" />,
    },
    {
      id: "3",
      priority: "low",
      title: "Você está com uma sequência de 7 dias de estudo!",
      description: "Continue assim para ganhar mais pontos de experiência.",
      actions: [
        {
          label: "Ver Conquistas",
          icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
          variant: "outline",
        },
      ],
      icon: <Zap className="h-5 w-5 text-green-500" />,
    },
  ];

  // Sample study time data
  const studyTimeData = {
    total: 32,
    goal: 40,
    progress: 80, // 32/40 = 80%
    byDay: [
      { day: "Seg", hours: 5 },
      { day: "Ter", hours: 6 },
      { day: "Qua", hours: 4 },
      { day: "Qui", hours: 7 },
      { day: "Sex", hours: 5 },
      { day: "Sáb", hours: 3 },
      { day: "Dom", hours: 2 },
    ],
    bySubject: [
      { subject: "Matemática", hours: 10, color: "#FF6B00" },
      { subject: "Física", hours: 8, color: "#FF8C40" },
      { subject: "Química", hours: 6, color: "#E85D04" },
      { subject: "Biologia", hours: 5, color: "#DC2F02" },
      { subject: "História", hours: 3, color: "#9D0208" },
    ],
  };

  // Sample last accessed classes
  const lastAccessedClasses = [
    {
      id: "1",
      title: "Funções Trigonométricas",
      discipline: "Matemática",
      professor: "Prof. Carlos Santos",
      progress: 75,
      thumbnail:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80",
      lastAccessed: "Hoje, 10:30",
    },
    {
      id: "2",
      title: "Mecânica Quântica - Introdução",
      discipline: "Física",
      professor: "Prof. Roberto Alves",
      progress: 45,
      thumbnail:
        "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&q=80",
      lastAccessed: "Ontem, 15:20",
    },
    {
      id: "3",
      title: "Titulação e pH",
      discipline: "Química",
      professor: "Profa. Ana Martins",
      progress: 90,
      thumbnail:
        "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=300&q=80",
      lastAccessed: "2 dias atrás, 14:15",
    },
  ];

  // Sample ranking data
  const rankingData = {
    position: 42,
    total: 210,
    points: 3750,
    nextReward: 4000,
    progress: 75, // (3750/4000)*100 = 93.75%
    trend: "+5", // Subiu 5 posições
  };

  // Sample subject progress data
  const subjectProgressData = [
    { subject: "Matemática", progress: 85, goal: 90, color: "#FF6B00" },
    { subject: "Física", progress: 72, goal: 80, color: "#FF8C40" },
    { subject: "Química", progress: 65, goal: 75, color: "#E85D04" },
    { subject: "Biologia", progress: 90, goal: 85, color: "#DC2F02" },
    { subject: "História", progress: 78, goal: 80, color: "#9D0208" },
  ];

  // Sample today's events data
  const todayEventsData = [
    {
      id: "1",
      type: "aula",
      title: "Aula de Matemática",
      time: "10:00 - 11:30",
      status: "agora",
      discipline: "Matemática",
      isOnline: true,
    },
    {
      id: "2",
      type: "trabalho",
      title: "Entrega de Trabalho",
      time: "até 18:00",
      status: "pendente",
      discipline: "Química",
      isOnline: true,
    },
  ];

  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4" />;
      case "trabalho":
        return <FileEdit className="h-4 w-4" />;
      case "prova":
        return <AlertCircle className="h-4 w-4" />;
      case "reuniao":
        return <Users className="h-4 w-4" />;
      case "lembrete":
        return <Bell className="h-4 w-4" />;
      case "tarefa":
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Get event color based on type
  const getEventColor = (type: string) => {
    switch (type) {
      case "aula":
        return "blue";
      case "trabalho":
      case "tarefa":
        return "amber";
      case "prova":
        return "red";
      case "reuniao":
        return "green";
      case "lembrete":
        return "yellow";
      case "evento":
        return "purple";
      default:
        return "gray";
    }
  };

  // Get task icon based on type
  const getTaskIcon = (discipline: string) => {
    switch (discipline) {
      case "Matemática":
        return <span className="text-[#FF6B00] font-bold">π</span>;
      case "Física":
        return <span className="text-[#FF8C40] font-bold">⚛</span>;
      case "Química":
        return <span className="text-[#E85D04] font-bold">⚗</span>;
      case "Biologia":
        return <span className="text-[#DC2F02] font-bold">🧬</span>;
      case "História":
        return <span className="text-[#9D0208] font-bold">📜</span>;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "média":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agora":
        return <Badge className="bg-green-500 text-white">Agora</Badge>;
      case "pendente":
        return <Badge className="bg-amber-500 text-white">Pendente</Badge>;
      default:
        return null;
    }
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      // Simulate search suggestions
      const suggestions = [
        "Aula de Matemática",
        "Prova de Física",
        "Grupo de Estudos",
        "Entrega de Trabalho",
        "Matemática",
        "Física",
        "Prof. Carlos Santos",
      ].filter((item) => item.toLowerCase().includes(query.toLowerCase()));

      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(suggestions.length > 0);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  // Open event details modal
  const openEventDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  // Add new event
  const handleAddEvent = (newEvent: any) => {
    if (newEvent.startDate) {
      const eventDate = new Date(newEvent.startDate);
      const day = eventDate.getDate();

      // Add color based on event type
      const eventWithColor = {
        ...newEvent,
        color: getEventColor(newEvent.type),
        time: newEvent.startTime || "00:00",
      };

      // Add the event to the eventData state
      const updatedEvents = { ...eventData };
      if (updatedEvents[day]) {
        updatedEvents[day] = [...updatedEvents[day], eventWithColor];
      } else {
        updatedEvents[day] = [eventWithColor];
      }

      setEventData(updatedEvents);

      // Força atualização do componente de próximos eventos
      setTimeout(() => {
        const upcomingEventsUpdated = getUpcomingEvents();
        // Este console.log ajuda a verificar se os eventos estão sendo atualizados corretamente
        console.log("Próximos eventos atualizados:", upcomingEventsUpdated);
      }, 100);

      // Exibe uma mensagem de sucesso
      toast({
        title: "Evento adicionado",
        description: "O evento foi adicionado com sucesso ao seu calendário e listado em Próximos Eventos.",
      });
    }
  };

  // Edit event
  const handleEditEvent = (editedEvent: any) => {
    const updatedEvents = { ...eventData };

    // Find the event in all days and update it
    let eventFound = false;

    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      const eventIndex = updatedEvents[dayNum].findIndex(
        (event) => event.id === editedEvent.id,
      );

      if (eventIndex !== -1) {
        // Update the event in place
        updatedEvents[dayNum][eventIndex] = {
          ...editedEvent,
          color: getEventColor(editedEvent.type),
          time: editedEvent.startTime || editedEvent.time || "00:00",
        };
        eventFound = true;
      }
    });

    // If the event wasn't found (rare case) or if the date changed
    if (!eventFound && editedEvent.startDate) {
      const newDay = new Date(editedEvent.startDate).getDate();
      handleDeleteEvent(editedEvent.id);

      // Add to the new day
      const eventWithColor = {
        ...editedEvent,
        color: getEventColor(editedEvent.type),
        time: editedEvent.startTime || "00:00",
      };

      if (updatedEvents[newDay]) {
        updatedEvents[newDay] = [...updatedEvents[newDay], eventWithColor];
      } else {
        updatedEvents[newDay] = [eventWithColor];
      }
    }

    setEventData(updatedEvents);

    // Exibe uma mensagem de sucesso
    toast({
      title: "Evento atualizado",
      description: "O evento foi atualizado com sucesso.",
    });
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = { ...eventData };

    // Find and remove the event
    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      updatedEvents[dayNum] = updatedEvents[dayNum].filter(
        (event) => event.id !== eventId,
      );

      // Remove the day if it has no events
      if (updatedEvents[dayNum].length === 0) {
        delete updatedEvents[dayNum];
      }
    });

    setEventData(updatedEvents);
  };

  // Handle event drag and drop
  const handleEventDrop = (event: any, newDay: number) => {
    // First, remove the event from its original day
    const updatedEvents = { ...eventData };
    let eventToMove = null;

    // Find and remove the event from its original day
    Object.keys(updatedEvents).forEach((day) => {
      const dayNum = parseInt(day);
      const eventIndex = updatedEvents[dayNum].findIndex(
        (e) => e.id === event.id,
      );

      if (eventIndex !== -1) {
        // Save the event before removing it
        eventToMove = { ...updatedEvents[dayNum][eventIndex] };

        // Remove the event from its original day
        updatedEvents[dayNum] = updatedEvents[dayNum].filter(
          (e) => e.id !== event.id,
        );

        // Remove the day if it has no events
        if (updatedEvents[dayNum].length === 0) {
          delete updatedEvents[dayNum];
        }
      }
    });

    // If we found the event, add it to the new day
    if (eventToMove) {
      // Update the event's date if it has one
      if (eventToMove.startDate) {
        const oldDate = new Date(eventToMove.startDate);
        const newDate = new Date(oldDate);
        newDate.setDate(newDay);
        eventToMove.startDate = newDate;

        // Also update endDate if it exists
        if (eventToMove.endDate) {
          const oldEndDate = new Date(eventToMove.endDate);
          const dayDiff = Math.round(
            (oldEndDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          const newEndDate = new Date(newDate);
          newEndDate.setDate(newDate.getDate() + dayDiff);
          eventToMove.endDate = newEndDate;
        }
      }

      // Add the event to the new day
      if (updatedEvents[newDay]) {
        updatedEvents[newDay] = [...updatedEvents[newDay], eventToMove];
      } else {
        updatedEvents[newDay] = [eventToMove];
      }

      setEventData(updatedEvents);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Handle subject filter change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  // Handle add task
  const handleAddTask = (newTask: any) => {
    try {
      if (!newTask || !newTask.title) {
        console.error("Invalid task data", newTask);
        return;
      }

      // First close modal to prevent UI freezing
      setShowAddTaskModal(false);

      setTimeout(() => {
        // Format the task for the dashboard view
        const formattedTask = {
          id: newTask.id || `task-${Date.now()}`,
          title: newTask.title,
          discipline: newTask.discipline || "Geral",
          dueDate: newTask.dueDate
            ? `Vence ${new Date(newTask.dueDate).toLocaleDateString("pt-BR")}`
            : "Sem data definida",
          progress: newTask.progress || 0,
          urgent: newTask.priority === "alta",
          priority: newTask.priority || "média",
        };

        // Update the tasks list in the dashboard
        setTasksData((prev) => [formattedTask, ...prev]);

        // Show success message
        toast({
          title: "Tarefa adicionada",
          description: "A nova tarefa foi adicionada com sucesso.",
        });

        // Refresh the tasks view
        setTimeout(() => {
          const tasksView = document.querySelector(
            '[data-testid="tasks-view"]'
          );

          if (tasksView) {
            const refreshEvent = new CustomEvent("refresh-tasks", {
              detail: newTask,
            });
            tasksView.dispatchEvent(refreshEvent);
          }
        }, 200); // Small delay to ensure DOM is ready
      }, 100);
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Ocorreu um erro ao adicionar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Modals */}
      <EpictusAIAssistantModal
        open={showEpictusAIModal}
        onOpenChange={setShowEpictusAIModal}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
              Agenda
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm">
              Organize seus eventos, tarefas e compromissos acadêmicos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar eventos..."
              className="pl-9 w-[250px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            onClick={() => setShowAddEventModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Evento
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-center items-center mb-6">
          <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 p-2 rounded-xl shadow-md">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Home className="h-5 w-5 mr-1" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <CalendarIcon className="h-5 w-5 mr-1" /> Calendário
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <BookOpenCheck className="h-5 w-5 mr-1" /> Flow
            </TabsTrigger>
            <TabsTrigger
              value="tarefas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <CheckSquare className="h-5 w-5 mr-1" /> Tarefas
            </TabsTrigger>

            <TabsTrigger
              value="desafios"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Target className="h-5 w-5 mr-1" /> Desafios
            </TabsTrigger>
            <TabsTrigger
              value="rotina"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white px-4 py-2 text-base font-medium transition-all duration-300 rounded-lg"
            >
              <Clock className="h-5 w-5 mr-1" /> Rotina
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Visão Geral Tab */}
        <TabsContent value="visao-geral" className="mt-0">
          {/* Summary Cards Row */}
          <div className="mb-6">
            <MetricsGrid 
              onAddEvent={() => setShowAddEventModal(true)}
              onViewPerformanceDetails={() => setActiveTab("flow")}
              onViewRanking={() => setActiveTab("desafios")}
              onViewChallenges={() => setActiveTab("desafios")}
              onViewAllEvents={() => setActiveTab("calendario")}
            />
          </div>

          {/* Main Content Grid */}
           {/* Grade de cards de gerenciamento */}
           <div className="mt-6">
            <ManagementGrid />
          </div>

        </TabsContent>

        {/* Calendário Tab */}
        <TabsContent value="calendario" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Column */}
            <div className="lg:col-span-9">
              <div className="bg-[#001427] rounded-b-xl overflow-hidden shadow-md">
                {calendarView === "month" && (
                  <MonthView
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    eventData={eventData}
                    getEventIcon={getEventIcon}
                    openEventDetails={openEventDetails}
                    onEventDrop={handleEventDrop}
                    setCalendarView={setCalendarView}
                    calendarView={calendarView}
                  />
                )}
                {calendarView === "week" && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                          <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg tracking-wide">
                          Visualização Semanal
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "day" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("day")}
                          >
                            Dia
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "week" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("week")}
                          >
                            Semana
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "month" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("month")}
                          >
                            Mês
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white hover:bg-white/20 rounded-lg px-3"
                            onClick={() => setSelectedDay(new Date())}
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <WeekView openEventDetails={openEventDetails} />
                  </>
                )}
                {calendarView === "day" && (
                  <>
                    <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                          <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg tracking-wide">
                          Visualização Diária
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "day" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("day")}
                          >
                            Dia
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "week" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("week")}
                          >
                            Semana
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-none ${calendarView === "month" ? "bg-white text-[#FF6B00]" : "text-white hover:bg-white/20"}`}
                            onClick={() => setCalendarView("month")}
                          >
                            Mês
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white hover:bg-white/20 rounded-lg px-3"
                            onClick={() => setSelectedDay(new Date())}
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DayView
                      selectedDay={selectedDay}
                      openEventDetails={openEventDetails}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Próximos Eventos
                    </h3>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors px-2 py-1">
                    {upcomingEventsData.length} eventos
                  </Badge>
                </div>
                <div className="p-4 flex flex-col">
                  {upcomingEventsData.length > 0 ? (
                    <div className="divide-y divide-[#FF6B00]/10 dark:divide-[#FF6B00]/20 w-full max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {upcomingEventsData.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 hover:bg-[#FF6B00]/5 cursor-pointer transition-colors group"
                          onClick={() => openEventDetails(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <div 
                                className={`w-8 h-8 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                              >
                                {getEventIcon(event.type)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-[#FF6B00] transition-colors">
                                {event.title}                              </h4>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Clock className="h-3 w-3 mr-1 text-[#FF6B00]" />{" "}
                                {event.day} {event.startTime ? `às ${event.startTime}` : ""}
                              </div>
                              <div className="mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-[#FF6B00]/30 bg-transparent text-[#FF6B00] group-hover:bg-[#FF6B00]/10 transition-colors"
                                >
                                  {event.discipline}
                                </Badge>
                                {event.isOnline && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-blue-300/30 bg-transparent text-blue-500 ml-1 group-hover:bg-blue-500/10 transition-colors"
                                  >
                                    Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                        <CalendarIcon className="h-8 w-8 text-[#FF6B00]/40" />
                      </div>
                      <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Nenhum evento próximo</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                        Seus próximos eventos serão exibidos aqui à medida que você os adicionar ao seu calendário
                      </p>
                      <Button
                        onClick={() => setShowAddEventModal(true)}
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <EpictusAIWidget
                onOpenAssistant={() => setShowEpictusAIModal(true)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="mt-0">
          <FlowView />
        </TabsContent>

        {/* Tarefas Tab */}
        <TabsContent value="tarefas" className="mt-0">
          <TasksView
            onOpenAddTask={() => setShowAddTaskModal(true)}
            onOpenAISuggestions={() => setShowAISuggestionsModal(true)}
          />
          {/* Add Task Modal */}
          {showAddTaskModal && (
            <AddTaskModal
              open={showAddTaskModal}
              onOpenChange={setShowAddTaskModal}
              onAddTask={handleAddTask}
            />
          )}
          {/* AI Suggestions Modal */}
          <EpictusAISuggestionsModal
            open={showAISuggestionsModal}
            onOpenChange={setShowAISuggestionsModal}
          />
        </TabsContent>

        {/* Desafios Tab */}
        <TabsContent value="desafios" className="mt-0">
          <ChallengesView />
        </TabsContent>
        {/* Rotina Tab */}
        <TabsContent value="rotina" className="mt-0">
          <div>Essa interface está em desenvolvimento</div>
        </TabsContent>
      </Tabs>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          open={showAddEventModal}
          onOpenChange={setShowAddEventModal}
          onAddEvent={handleAddEvent}
          selectedDate={selectedDay}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <EventDetailsModal
          open={showEventDetailsModal}
          onOpenChange={setShowEventDetailsModal}
          event={selectedEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* Set Goal Modal */}
      {showSetGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Definir Meta de Estudo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta de horas por semana
                </label>
                <Input
                  type="number"
                  placeholder="40"
                  defaultValue={studyTimeData.goal}
                  className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Disciplina com foco
                </label>
                <select className="w-full border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg p-2 text-sm">
                  <option value="all">Todas as disciplinas</option>
                  <option value="matematica">Matemática</option>
                  <option value="fisica">Física</option>
                  <option value="quimica">Química</option>
                  <option value="biologia">Biologia</option>
                  <option value="historia">História</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSetGoalModal(false)}
                  className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  onClick={() => setShowSetGoalModal(false)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}