import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Smile, MoreVertical, Phone, Video, Search, Paperclip, X, Check, CheckCheck, Video as VideoIcon, Phone as PhoneIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabaseClient';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    farm_id: string;
    created_at: string;
    read: boolean;
    type?: 'text' | 'system' | 'call'; // Adicionado tipo para diferenciar mensagens
}

const Chat: React.FC = () => {
    const { currentUser } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [tempBannerUrl, setTempBannerUrl] = useState(bannerUrl);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const emojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚜', '🌾', '🌽', '🐄', '🐖', '🐔', '🌧️', '☀️'];

    useEffect(() => {
        if (currentUser.farm_id) {
            fetchMessages();
            subscribeToMessages();
        }
    }, [currentUser.farm_id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('farm_id', currentUser.farm_id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const subscribeToMessages = () => {
        if (!supabase) return;

        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `farm_id=eq.${currentUser.farm_id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string, type: 'text' | 'system' | 'call' = 'text') => {
        e?.preventDefault();
        const contentToSend = contentOverride || newMessage.trim();

        if (!contentToSend || !supabase) return;

        if (!contentOverride) setNewMessage(''); // Clear input only if it's a manual message
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        content: contentToSend,
                        sender_id: currentUser.email,
                        sender_name: currentUser.name,
                        farm_id: currentUser.farm_id,
                        read: false,
                        // type: type // Se você adicionar a coluna 'type' no banco futuramente
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            if (!contentOverride) alert('Erro ao enviar mensagem. Tente novamente.');
            if (!contentOverride) setNewMessage(contentToSend);
        } finally {
            setIsLoading(false);
        }
    };

    const startCall = (video: boolean) => {
        const roomName = `agro-inteligente-${currentUser.farm_id}-${Date.now()}`; // Nome único para a sala
        const callUrl = `https://meet.jit.si/${roomName}`;

        // Abrir a chamada em uma nova aba
        window.open(callUrl, '_blank');

        // Avisar no chat
        const icon = video ? '📹' : '📞';
        const text = video ? 'Chamada de Vídeo' : 'Chamada de Voz';
        const message = `${icon} Iniciou uma ${text}.\nClique para entrar: ${callUrl}`;

        handleSendMessage(undefined, message, 'call');
    };

    const handleEmojiClick = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const saveBanner = () => {
        setBannerUrl(tempBannerUrl);
        setIsEditingBanner(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // Detectar se é uma mensagem de link de chamada para renderizar diferente
    const isCallMessage = (content: string) => content.includes('meet.jit.si');

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-100">
            {/* Chat Header / Banner */}
            <div
                className="relative h-48 bg-cover bg-center shadow-md shrink-0 group"
                style={{ backgroundImage: `url(${bannerUrl})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>

                {/* Banner Controls */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditingBanner(true)}
                        className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                        title="Alterar imagem de fundo"
                    >
                        <Image size={20} />
                    </button>
                </div>

                {/* Edit Banner Modal/Input */}
                {isEditingBanner && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20 animate-fade-in">
                        <div className="bg-white p-4 rounded-xl w-full max-w-md shadow-2xl">
                            <h3 className="font-bold text-gray-800 mb-2">Alterar Imagem do Banner</h3>
                            <input
                                type="text"
                                value={tempBannerUrl}
                                onChange={(e) => setTempBannerUrl(e.target.value)}
                                placeholder="Cole a URL da imagem aqui..."
                                className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsEditingBanner(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveBanner}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                    <div className="text-white">
                        <h1 className="text-3xl font-bold mb-1 shadow-sm">Chat da Fazenda</h1>
                        <p className="text-green-100 flex items-center gap-2 text-sm font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            {messages.length} mensagens • {currentUser.name}
                        </p>
                    </div>
                    <div className="flex gap-3 text-white/90">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Search size={20} /></button>
                        <button
                            onClick={() => startCall(false)}
                            className="p-2 hover:bg-green-500/50 rounded-full transition-colors"
                            title="Chamada de Voz"
                        >
                            <Phone size={20} />
                        </button>
                        <button
                            onClick={() => startCall(true)}
                            className="p-2 hover:bg-green-500/50 rounded-full transition-colors"
                            title="Chamada de Vídeo"
                        >
                            <Video size={20} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreVertical size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] bg-opacity-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="text-gray-400" />
                        </div>
                        <p className="font-medium">Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Comece a conversa com sua equipe!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.email;
                        const isCall = isCallMessage(msg.content);

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 shadow-sm relative group ${isMe
                                            ? 'bg-[#d9fdd3] rounded-tr-none'
                                            : 'bg-white rounded-tl-none'
                                        } ${isCall ? 'border-2 border-green-400' : ''}`}
                                >
                                    {!isMe && (
                                        <p className="text-xs font-bold text-green-700 mb-1">{msg.sender_name}</p>
                                    )}

                                    {isCall ? (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-gray-800 text-sm font-semibold">{msg.content.split('\n')[0]}</p>
                                            <a
                                                href={msg.content.split(': ')[1]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <VideoIcon size={14} />
                                                Entrar na Chamada
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                                        {isMe && (
                                            <span className="text-blue-500">
                                                <CheckCheck size={14} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-gray-100 p-3 flex items-center gap-2 border-t border-gray-200">
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <Smile size={24} />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 bg-white p-3 rounded-xl shadow-xl border border-gray-200 grid grid-cols-4 gap-2 w-64 animate-fade-in z-10">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
                    <Paperclip size={24} />
                </button>

                <form onSubmit={(e) => handleSendMessage(e)} className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 p-3 rounded-lg border-none focus:ring-0 bg-white shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className={`p-3 rounded-full shadow-md transition-all ${newMessage.trim()
                                ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
