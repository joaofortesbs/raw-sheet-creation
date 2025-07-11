
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Users, 
  Globe, 
  Lock, 
  Eye,
  Trash2,
  Save,
  X,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GroupSettings {
  // Configurações Gerais
  nome: string;
  descricao: string;
  disciplina_area: string;
  topico_especifico: string;
  tags: string[];
  codigo_unico: string;

  // Configurações de Privacidade
  is_public: boolean;
  is_private: boolean;
  is_visible_to_all: boolean;
  is_visible_to_partners: boolean;

  // Configurações de Membros
  max_members: number;
  require_approval: boolean;
  allow_member_invites: boolean;

  // Configurações de Notificações
  notify_new_members: boolean;
  notify_new_messages: boolean;
  notify_new_materials: boolean;

  // Configurações Avançadas
  backup_automatico: boolean;
  notificacoes_ativas: boolean;
  moderacao_automatica: boolean;
}

interface AjustesTabProps {
  groupId: string;
}

export default function AjustesTab({ groupId }: AjustesTabProps) {
  const [settings, setSettings] = useState<GroupSettings>({
    nome: '',
    descricao: '',
    disciplina_area: '',
    topico_especifico: '',
    tags: [],
    codigo_unico: '',
    is_public: false,
    is_private: false,
    is_visible_to_all: false,
    is_visible_to_partners: false,
    max_members: 50,
    require_approval: false,
    allow_member_invites: true,
    notify_new_members: true,
    notify_new_messages: true,
    notify_new_materials: true,
    backup_automatico: true,
    notificacoes_ativas: true,
    moderacao_automatica: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('gerais');
  const [newTag, setNewTag] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadGroupSettings();
    loadGroupImages();
  }, [groupId]);

  const loadGroupImages = async () => {
    try {
      const retries = 3;
      const delay = 2000;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          // Try to load banner
          const { data: bannerData, error: bannerError } = await supabase.storage
            .from('group-banners')
            .download(`${groupId}-banner`);

          if (bannerData && !bannerError) {
            const bannerUrl = URL.createObjectURL(bannerData);
            setBannerPreview(bannerUrl);
            console.log(`Banner loaded for group ${groupId}`);
          } else if (bannerError && bannerError.message !== 'Object not found') {
            throw bannerError;
          }

          // Try to load photo
          const { data: photoData, error: photoError } = await supabase.storage
            .from('group-photos')
            .download(`${groupId}-photo`);

          if (photoData && !photoError) {
            const photoUrl = URL.createObjectURL(photoData);
            setPhotoPreview(photoUrl);
            console.log(`Photo loaded for group ${groupId}`);
          } else if (photoError && photoError.message !== 'Object not found') {
            throw photoError;
          }

          return;

        } catch (error) {
          console.warn(`Attempt ${attempt} to load images for group ${groupId} failed:`, error);
          
          if (attempt === retries) {
            console.error(`Failed to load images for group ${groupId} after ${retries} attempts:`, error);
          } else {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error) {
      console.error(`Error loading images for group ${groupId}:`, error);
    }
  };

  const loadGroupSettings = async () => {
    try {
      const { data: groupData, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      setSettings({
        nome: groupData.nome || '',
        descricao: groupData.descricao || '',
        disciplina_area: groupData.disciplina_area || '',
        topico_especifico: groupData.topico_especifico || '',
        tags: groupData.tags || [],
        codigo_unico: groupData.codigo_unico || '',
        is_public: groupData.is_public ?? false,
        is_private: groupData.is_private ?? false,
        is_visible_to_all: groupData.is_visible_to_all ?? false,
        is_visible_to_partners: groupData.is_visible_to_partners ?? false,
        max_members: groupData.max_members ?? 50,
        require_approval: groupData.require_approval ?? false,
        allow_member_invites: groupData.allow_member_invites ?? true,
        notify_new_members: groupData.notify_new_members ?? true,
        notify_new_messages: groupData.notify_new_messages ?? true,
        notify_new_materials: groupData.notify_new_materials ?? true,
        backup_automatico: groupData.backup_automatico ?? true,
        notificacoes_ativas: groupData.notificacoes_ativas ?? true,
        moderacao_automatica: groupData.moderacao_automatica ?? false,
      });

      console.log(`Campos da mini-seção Ajustes preenchidos para o grupo ${groupData.id || 'desconhecido'}.`);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do grupo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .update({
          nome: settings.nome,
          descricao: settings.descricao,
          disciplina_area: settings.disciplina_area,
          topico_especifico: settings.topico_especifico,
          tags: settings.tags,
          is_public: settings.is_public,
          is_private: settings.is_private,
          is_visible_to_all: settings.is_visible_to_all,
          is_visible_to_partners: settings.is_visible_to_partners,
          max_members: settings.max_members,
          require_approval: settings.require_approval,
          allow_member_invites: settings.allow_member_invites,
          notify_new_members: settings.notify_new_members,
          notify_new_messages: settings.notify_new_messages,
          notify_new_materials: settings.notify_new_materials,
          backup_automatico: settings.backup_automatico,
          notificacoes_ativas: settings.notificacoes_ativas,
          moderacao_automatica: settings.moderacao_automatica
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      setSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateImageFile = (file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem PNG, JPG ou JPEG.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter menos de 5MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImages = async () => {
    if (!bannerFile && !photoFile) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Selecione pelo menos uma imagem para salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingImages(true);
    
    try {
      const retries = 3;
      const delay = 2000;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          if (bannerFile) {
            console.log(`Uploading banner for group ${groupId}, attempt ${attempt}`);
            const { error: bannerError } = await supabase.storage
              .from('group-banners')
              .upload(`${groupId}-banner`, bannerFile, { upsert: true });
            
            if (bannerError) throw bannerError;
            console.log(`Banner uploaded successfully for group ${groupId}`);
          }

          if (photoFile) {
            console.log(`Uploading photo for group ${groupId}, attempt ${attempt}`);
            const { error: photoError } = await supabase.storage
              .from('group-photos')
              .upload(`${groupId}-photo`, photoFile, { upsert: true });
            
            if (photoError) throw photoError;
            console.log(`Photo uploaded successfully for group ${groupId}`);
          }

          toast({
            title: "Sucesso",
            description: "Imagens salvas com sucesso!",
          });

          // Reset form
          setBannerFile(null);
          setPhotoFile(null);
          setBannerPreview(null);
          setPhotoPreview(null);
          
          console.log(`Images saved successfully for group ${groupId} on attempt ${attempt}`);
          return;

        } catch (error) {
          console.warn(`Attempt ${attempt} to save images for group ${groupId} failed:`, error);
          
          if (attempt === retries) {
            throw error;
          } else {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error) {
      console.error(`Error saving images for group ${groupId}:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as imagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingImages(false);
    }
  };

  const menuItems = [
    { id: 'gerais', label: 'Informações Básicas', icon: Settings },
    { id: 'aparencia', label: 'Aparência & Tema', icon: Eye },
    { id: 'privacidade', label: 'Privacidade & Acesso', icon: Shield },
    { id: 'metas', label: 'Metas & Objetivos', icon: Users },
    { id: 'regras', label: 'Regras & Conduta', icon: Bell },
    { id: 'avancado', label: 'Configurações Avançadas', icon: AlertTriangle }
  ];

  const renderConfiguracoesGerais = () => (
    <div className="space-y-8">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327] backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 bg-white dark:bg-[#001327]">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <span>Nome do Grupo</span>
              <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="nome"
              value={settings.nome}
              onChange={(e) => setSettings(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do grupo"
              className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={settings.descricao}
              onChange={(e) => setSettings(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o grupo e seus objetivos"
              rows={4}
              className="border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="disciplina" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Disciplina/Área
              </Label>
              <Input
                id="disciplina"
                value={settings.disciplina_area}
                onChange={(e) => setSettings(prev => ({ ...prev, disciplina_area: e.target.value }))}
                placeholder="Ex: Matemática, Física, etc."
                className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="topico" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tópico Específico
              </Label>
              <Input
                id="topico"
                value={settings.topico_especifico}
                onChange={(e) => setSettings(prev => ({ ...prev, topico_especifico: e.target.value }))}
                placeholder="Ex: Álgebra Linear, Mecânica, etc."
                className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="codigoUnico" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <span>Código Único</span>
              <div className="w-4 h-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                id="codigoUnico"
                value={settings.codigo_unico || 'Carregando...'}
                readOnly
                className="flex-1 h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20 text-gray-900 dark:text-white font-mono text-center text-lg tracking-wider rounded-lg cursor-default"
              />
              <Button
                type="button"
                onClick={() => {
                  if (settings.codigo_unico) {
                    navigator.clipboard.writeText(settings.codigo_unico);
                    toast({
                      title: "Código copiado!",
                      description: "O código único foi copiado para a área de transferência.",
                    });
                  }
                }}
                className="h-12 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
                disabled={!settings.codigo_unico}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Compartilhe este código para que outros usuários possam encontrar e entrar no seu grupo
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tags do Grupo
            </Label>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-500/30 min-h-[80px]">
              <div className="flex flex-wrap gap-3 mb-3">
                {settings.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white hover:text-orange-200 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {settings.tags.length === 0 && (
                  <span className="text-orange-500 dark:text-orange-400 text-sm italic">
                    Nenhuma tag adicionada ainda
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Digite uma nova tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
              <Button 
                type="button" 
                onClick={addTag} 
                className="h-12 px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacidade = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            Privacidade & Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Grupo Público</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qualquer pessoa pode encontrar e participar</p>
                </div>
              </div>
              <Switch
                checked={settings.is_public}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_public: checked,
                  is_private: !checked
                }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Grupo Privado</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apenas por convite</p>
                </div>
              </div>
              <Switch
                checked={settings.is_private}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_private: checked,
                  is_public: !checked
                }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Visível para Parceiros</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visível apenas para usuários conectados</p>
                </div>
              </div>
              <Switch
                checked={settings.is_visible_to_partners}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_visible_to_partners: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembros = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            Gerenciamento de Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-3">
            <Label htmlFor="max-members" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Número Máximo de Membros</Label>
            <Select value={settings.max_members.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, max_members: parseInt(value) }))}>
              <SelectTrigger className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#001327] border-orange-200 dark:border-orange-500/50">
                <SelectItem value="10" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">10 membros</SelectItem>
                <SelectItem value="25" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">25 membros</SelectItem>
                <SelectItem value="50" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">50 membros</SelectItem>
                <SelectItem value="100" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">100 membros</SelectItem>
                <SelectItem value="999" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
            <div>
              <Label className="text-gray-800 dark:text-white font-semibold">Aprovação Obrigatória</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Novos membros precisam ser aprovados</p>
            </div>
            <Switch
              checked={settings.require_approval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_approval: checked }))}
              className="data-[state=checked]:bg-[#FF6B00]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
            <div>
              <Label className="text-gray-800 dark:text-white font-semibold">Membros Podem Convidar</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permite que membros convidem outros usuários</p>
            </div>
            <Switch
              checked={settings.allow_member_invites}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_member_invites: checked }))}
              className="data-[state=checked]:bg-[#FF6B00]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificacoes = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Bell className="w-4 h-4 text-white" />
            </div>
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novos Membros</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar quando alguém entrar no grupo</p>
              </div>
              <Switch
                checked={settings.notify_new_members}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_members: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novas Mensagens</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar sobre novas discussões</p>
              </div>
              <Switch
                checked={settings.notify_new_messages}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_messages: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novos Materiais</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar quando materiais forem adicionados</p>
              </div>
              <Switch
                checked={settings.notify_new_materials}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_materials: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAvancado = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Backup Automático</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Backup automático das discussões e materiais</p>
              </div>
              <Switch
                checked={settings.backup_automatico}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, backup_automatico: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Notificações Ativas</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sistema de notificações do grupo</p>
              </div>
              <Switch
                checked={settings.notificacoes_ativas}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notificacoes_ativas: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Moderação Automática</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Filtro automático de conteúdo inadequado</p>
              </div>
              <Switch
                checked={settings.moderacao_automatica}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, moderacao_automatica: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-2 border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-900/20">
        <CardHeader className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 border-b border-red-200 dark:border-red-500/30">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Estas ações são irreversíveis. Tenha cuidado ao executá-las.
          </p>
          <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Grupo
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAparencia = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span>Aparência & Tema</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-8 bg-white dark:bg-[#001327]">
        <div className="space-y-6">
          {/* Banner Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <Label htmlFor="banner-upload" className="text-lg font-semibold text-gray-800 dark:text-white">
                Banner do Grupo
              </Label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
              Adicione um banner para personalizar a aparência do seu grupo (PNG, JPG, JPEG - Máx: 5MB)
            </p>
            
            {/* Banner Preview */}
            <div className="ml-9 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-500/30">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                {bannerPreview ? (
                  <img 
                    src={bannerPreview} 
                    alt="Banner Preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum banner selecionado</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ml-9 flex gap-3">
              <Input
                id="banner-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleBannerChange}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('banner-upload')?.click()}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Escolher Banner
              </Button>
              {bannerFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreview(null);
                  }}
                  className="border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <Label htmlFor="photo-upload" className="text-lg font-semibold text-gray-800 dark:text-white">
                Foto do Grupo
              </Label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
              Adicione uma foto que represente seu grupo (PNG, JPG, JPEG - Máx: 5MB)
            </p>
            
            {/* Photo Preview */}
            <div className="ml-9 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-500/30">
              <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Photo Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sem foto</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ml-9 flex gap-3 justify-center">
              <Input
                id="photo-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Escolher Foto
              </Button>
              {photoFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Save Images Button */}
          {(bannerFile || photoFile) && (
            <div className="pt-4 border-t border-orange-200 dark:border-orange-500/30">
              <Button
                onClick={saveImages}
                disabled={isSavingImages}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                {isSavingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Salvando Imagens...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Salvar Imagens
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderMetas = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span>Metas & Objetivos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-16 bg-white dark:bg-[#001327]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
            <Users className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Metas & Objetivos
          </h4>
          <p className="text-orange-600 dark:text-orange-400 max-w-md">
            Configurações de metas estarão disponíveis em breve. Defina objetivos e acompanhe o progresso do grupo.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderRegras = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <span>Regras & Conduta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-16 bg-white dark:bg-[#001327]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
            <Bell className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Regras & Conduta
          </h4>
          <p className="text-orange-600 dark:text-orange-400 max-w-md">
            Configurações de regras estarão disponíveis em breve. Estabeleça diretrizes e normas para o grupo.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[800px] h-full bg-white dark:bg-[#001327] rounded-xl shadow-2xl overflow-hidden border border-orange-200/30 dark:border-orange-500/20">
      {/* Menu Lateral */}
      <div className="w-72 bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50 dark:from-[#001327] dark:via-[#002442] dark:to-[#001327] border-r border-orange-200 dark:border-orange-500/30 flex-shrink-0 shadow-2xl">
        <div className="p-8 border-b border-orange-200/50 dark:border-orange-500/30 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-[#001327] dark:to-[#002442]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Configurações</h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">Gerencie seu grupo</p>
            </div>
          </div>
        </div>
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-2xl border border-orange-300/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-orange-50 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 hover:text-orange-700 dark:hover:text-orange-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-white/20' 
                    : 'group-hover:bg-orange-200/30 dark:group-hover:bg-orange-500/20'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Decoração no menu lateral */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-100/50 dark:from-[#001327] to-transparent opacity-50"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#001327]">
        <div className="p-8 min-h-full">
          {/* Header do conteúdo */}
          <div className="mb-8 pb-6 border-b border-orange-200/50 dark:border-orange-500/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-orange-200 dark:ring-orange-500/30">
                {menuItems.find(item => item.id === activeSection)?.icon && 
                  React.createElement(menuItems.find(item => item.id === activeSection)!.icon, { className: "w-6 h-6 text-white" })
                }
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                  Configure as opções do seu grupo de estudos
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo das seções */}
          <div className="space-y-6">
            {activeSection === 'gerais' && renderConfiguracoesGerais()}
            {activeSection === 'aparencia' && renderAparencia()}
            {activeSection === 'privacidade' && renderPrivacidade()}
            {activeSection === 'membros' && renderMembros()}
            {activeSection === 'notificacoes' && renderNotificacoes()}
            {activeSection === 'avancado' && renderAvancado()}
            {activeSection === 'metas' && renderMetas()}
            {activeSection === 'regras' && renderRegras()}
          </div>

          {/* Botão de Salvar */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-[#001327]/95 border-t border-orange-200/50 dark:border-orange-500/30 p-6 mt-8 backdrop-blur-sm">
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={loadGroupSettings}
                className="px-6 py-3 border-2 border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:border-orange-400 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={saveSettings} 
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
