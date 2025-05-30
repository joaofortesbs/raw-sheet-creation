import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Image as ImageIcon, 
  Paperclip, 
  MoreVertical, 
  Mic, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateAIResponse, clearConversationHistory, getConversationHistory } from "@/services/aiChatService";
import { v4 as uuidv4 } from 'uuid';

export type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
};

const CHAT_STORAGE_KEY = 'chat_history';
const SESSION_ID_KEY = 'chat_session_id';

const ChatIAInterface = () => {
  // Gerar ou recuperar o ID da sessão
  const [sessionId, setSessionId] = useState<string>(() => {
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
    return savedSessionId || uuidv4();
  });

  // Carregar mensagens do armazenamento local e do serviço aiChatService
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      // Primeiro verificar se há histórico no serviço de IA
      const aiServiceHistory = getConversationHistory(sessionId);

      // Se tiver histórico no serviço, converter para o formato Message
      if (aiServiceHistory && aiServiceHistory.length > 0) {
        // Pular a primeira mensagem que é do sistema (não visível para o usuário)
        const visibleHistory = aiServiceHistory.slice(1);

        return visibleHistory.map((msg, index) => ({
          id: `${msg.role}-${index}`,
          sender: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date()
        }));
      }

      // Se não tiver no serviço, tentar carregar do localStorage
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        // Converter strings de data para objetos Date
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de chat:", error);
    }

    // Mensagem de boas-vindas padrão
    return [{
      id: "welcome-message",
      sender: "ai",
      content: "Olá! Eu sou a Epictus IA, sua assistente para estudos. Como posso ajudar você hoje? Posso me lembrar de nossas conversas anteriores nesta sessão.",
      timestamp: new Date()
    }];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Salvar mensagens no armazenamento local sempre que houver alterações
  useEffect(() => {
    try {
      // Salvar somente se houver mais mensagens além da boas-vindas
      if (messages.length > 1 || messages[0].id !== "welcome-message") {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }

      // Salvar ID da sessão
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    } catch (error) {
      console.error("Erro ao salvar histórico de chat:", error);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle scroll events to show/hide the scroll button
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollPosition = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      // Show button if not near the bottom (more than 300px from bottom)
      const isNearBottom = scrollHeight - scrollPosition - clientHeight < 300;
      setShowScrollToBottom(!isNearBottom);
    };

    // Find all potential scroll containers
    const scrollContainers = document.querySelectorAll('.chat-scroll-area, .ScrollAreaViewport');

    scrollContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll);
    });

    return () => {
      scrollContainers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  // Also check for scroll position when messages change
  useEffect(() => {
    // Find scroll container
    const container = document.querySelector('.chat-scroll-area, .ScrollAreaViewport') as HTMLElement;
    if (container) {
      const scrollPosition = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      const isNearBottom = scrollHeight - scrollPosition - clientHeight < 300;
      setShowScrollToBottom(!isNearBottom);
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Limpar histórico da conversa
  const handleClearChat = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico de conversa?")) {
      // Limpar histórico no serviço
      clearConversationHistory(sessionId);

      // Gerar nova sessão
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem(SESSION_ID_KEY, newSessionId);

      // Limpar mensagens exibidas
      setMessages([{
        id: "welcome-message",
        sender: "ai",
        content: "Histórico de chat limpo. Como posso ajudar você hoje?",
        timestamp: new Date()
      }]);

      // Limpar localStorage
      localStorage.removeItem(CHAT_STORAGE_KEY);

      console.log("Histórico de conversa limpo completamente. Nova sessão:", newSessionId);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Usar o serviço aiChatService para manter histórico de contexto
      const response = await generateAIResponse(userMessage.content, sessionId);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Opcional: sincronizar o estado local com o histórico mais recente do serviço
      // Isso garante que estamos sempre alinhados com o estado interno do serviço
      const latestHistory = getConversationHistory(sessionId);
      if (latestHistory && latestHistory.length > 0) {
        console.log("Histórico de conversa atualizado com sucesso!", latestHistory.length, "mensagens");
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background dark:bg-[#001427]">
      <div className="border-b dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-[#FF6B00]/20">
              <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
              <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                <Bot size={18} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg leading-none">Chat Epictus IA</h2>
              <p className="text-sm text-muted-foreground">Assistente inteligente para seus estudos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleClearChat}
              title="Limpar histórico de conversa"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpar histórico</span>
            </Button>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
              Online
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 overflow-y-auto relative chat-scroll-area">
        {showScrollToBottom && (
          <div className="fixed bottom-24 right-8 z-50 animate-pulse">
            <Button
              onClick={scrollToBottom}
              className="rounded-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-lg w-12 h-12 p-0 flex items-center justify-center"
              aria-label="Scroll to latest messages"
            >
              <Send size={20} className="rotate-90" />
            </Button>
          </div>
        )}
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex gap-3 max-w-[80%]">
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1 bg-[#FF6B00]/20">
                    <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                    <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="relative">
                  <Card className={`border-0 shadow-sm ${
                    message.sender === "user" 
                      ? "bg-[#FF6B00] text-white"
                      : "bg-muted dark:bg-gray-800/60"
                  }`}>
                    <CardContent className="p-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>

                  {/* Botões de feedback para mensagens da IA */}
                  {message.sender === "ai" && message.id !== "welcome-message" && (
                    <div className="absolute right-0 top-0 flex space-x-1 -mr-20 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20"
                        title="Resposta útil"
                        onClick={() => {
                          // Feedback positivo
                          console.log("Feedback positivo para mensagem:", message.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up">
                          <path d="M7 10v12"/>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                        </svg>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
                        title="Resposta não útil"
                        onClick={() => {
                          // Feedback negativo
                          console.log("Feedback negativo para mensagem:", message.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-down">
                          <path d="M17 14V2"/>
                          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
                        </svg>
                      </Button>

                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        title="Scroll to Latest"
                        onClick={scrollToBottom}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down">
                          <path d="M12 5v14"/>
                          <path d="m19 12-7 7-7-7"/>
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-[#29335C]/20 text-[#29335C] dark:bg-[#29335C]/40 dark:text-white">
                      <UserIcon size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8 mt-1 bg-[#FF6B00]/20">
                  <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" />
                  <AvatarFallback className="bg-[#FF6B00]/20 text-[#FF6B00]">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
                <Card className="border-0 shadow-sm bg-muted dark:bg-gray-800/60">
                  <CardContent className="p-3 flex items-center gap-1">
                    <Loader2 size={16} className="animate-spin" />
                    <p>Processando...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t dark:border-gray-800">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <Button variant="outline" size="icon" className="rounded-full shrink-0">
            <Paperclip size={18} />
          </Button>
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="min-h-[40px] max-h-[200px] resize-none pe-10 rounded-xl"
              rows={1}
              onInput={resizeTextarea}
            />
            <Button variant="ghost" size="icon" className="absolute right-2 bottom-1.5 h-7 w-7 text-muted-foreground">
              <Mic size={18} />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full h-10 w-10 p-0 shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatIAInterface;