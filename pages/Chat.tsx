import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabaseClient';
import { Message } from '../types';

const Chat: React.FC = () => {
    const { currentUser } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!supabase) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('farm_id', currentUser.farm_id)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching messages:', error);
            if (data) setMessages(data as Message[]);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`room_${currentUser.farm_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `farm_id=eq.${currentUser.farm_id}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser.farm_id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageToSend = {
            content: newMessage,
            sender_id: currentUser.email, // Using email as ID for simplicity in this demo
            sender_name: currentUser.name,
            farm_id: currentUser.farm_id,
        };

        // Optimistic update
        // We don't necessarily need to add it locally if the subscription is fast, 
        // but it makes the UI feel snappier. However, to avoid duplicates if the 
        // subscription catches it, we might rely on the subscription or handle IDs carefully.
        // For this simple implementation, let's rely on the subscription to add it to the list
        // OR add it optimistically and filter duplicates. 
        // Let's just send it and let the subscription handle the update for consistency.

        if (supabase) {
            const { error } = await supabase.from('messages').insert([messageToSend]);
            if (error) {
                console.error('Error sending message:', error);
                alert('Erro ao enviar mensagem. Tente novamente.');
            } else {
                setNewMessage('');
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Chat da Fazenda</h2>
                    <p className="text-xs text-gray-500">Canal oficial de comunicação interna</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/10">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Comece a conversa com sua equipe!</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.email;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-green-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                {!isMe && (
                                    <p className="text-xs font-bold text-green-700 mb-1">{msg.sender_name}</p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
