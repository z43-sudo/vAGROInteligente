import React from 'react';
import { Construction } from 'lucide-react';

interface GenericPageProps {
  title: string;
}

const GenericPage: React.FC<GenericPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in space-y-4">
       <div className="bg-gray-100 p-6 rounded-full">
         <Construction size={48} className="text-gray-400" />
       </div>
       <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
       <p className="text-gray-500 max-w-md">
         Esta funcionalidade está em desenvolvimento. Em breve você poderá gerenciar {title.toLowerCase()} completo por aqui.
       </p>
       <button className="mt-4 px-6 py-2 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors">
         Voltar ao Dashboard
       </button>
    </div>
  );
};

export default GenericPage;