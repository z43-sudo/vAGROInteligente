import React from 'react';
import AgroNewsPanel from '../components/AgroNewsPanel';

const News: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Central de Notícias</h1>
                    <p className="text-green-100 max-w-2xl">
                        Acompanhe as últimas atualizações do agronegócio, mercado de commodities e políticas agrícolas em tempo real.
                    </p>
                </div>
            </div>

            <AgroNewsPanel />
        </div>
    );
};

export default News;
