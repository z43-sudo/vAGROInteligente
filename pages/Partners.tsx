import React, { useState } from 'react';
import { Award, TrendingUp, Users, Globe, Star, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface Partner {
    id: string;
    name: string;
    category: string;
    logo: string;
    description: string;
    benefits: string[];
    tier: 'platinum' | 'gold' | 'silver';
    website: string;
    since: string;
}

const Partners: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const partners: Partner[] = [
        {
            id: '1',
            name: 'John Deere',
            category: 'Máquinas Agrícolas',
            logo: '🚜',
            description: 'Líder mundial em equipamentos agrícolas, oferecendo tecnologia de ponta para aumentar a produtividade.',
            benefits: ['Descontos exclusivos em tratores', 'Suporte técnico prioritário', 'Treinamentos gratuitos'],
            tier: 'platinum',
            website: 'johndeere.com.br',
            since: '2020'
        },
        {
            id: '2',
            name: 'Stihl',
            category: 'Ferramentas',
            logo: '🪚',
            description: 'Referência em motosserras e ferramentas de alta performance para o campo.',
            benefits: ['10% de desconto em produtos', 'Garantia estendida', 'Manutenção gratuita no 1º ano'],
            tier: 'platinum',
            website: 'stihl.com.br',
            since: '2021'
        },
        {
            id: '3',
            name: 'Valtra',
            category: 'Máquinas Agrícolas',
            logo: '🚜',
            description: 'Tratores robustos e confiáveis, desenvolvidos para o agronegócio brasileiro.',
            benefits: ['Financiamento facilitado', 'Peças com desconto', 'Assistência técnica 24/7'],
            tier: 'platinum',
            website: 'valtra.com.br',
            since: '2020'
        },
        {
            id: '4',
            name: 'Bayer',
            category: 'Defensivos Agrícolas',
            logo: '🧪',
            description: 'Soluções inovadoras em defensivos e sementes para proteção e produtividade.',
            benefits: ['Consultoria agronômica gratuita', 'Descontos progressivos', 'Programa de fidelidade'],
            tier: 'gold',
            website: 'bayer.com.br',
            since: '2021'
        },
        {
            id: '5',
            name: 'Basf',
            category: 'Defensivos Agrícolas',
            logo: '🌿',
            description: 'Tecnologia química aplicada ao agronegócio para máxima eficiência.',
            benefits: ['Amostras grátis', 'Análise de solo gratuita', 'Suporte técnico especializado'],
            tier: 'gold',
            website: 'basf.com.br',
            since: '2022'
        },
        {
            id: '6',
            name: 'Yara',
            category: 'Fertilizantes',
            logo: '🌱',
            description: 'Líder global em nutrição de plantas e soluções sustentáveis.',
            benefits: ['Plano nutricional personalizado', '15% de desconto', 'Entrega programada'],
            tier: 'gold',
            website: 'yara.com.br',
            since: '2021'
        },
        {
            id: '7',
            name: 'Jacto',
            category: 'Pulverizadores',
            logo: '💧',
            description: 'Equipamentos de pulverização de alta tecnologia e precisão.',
            benefits: ['Demonstração gratuita', 'Treinamento operacional', 'Desconto em peças'],
            tier: 'silver',
            website: 'jacto.com.br',
            since: '2022'
        },
        {
            id: '8',
            name: 'Stara',
            category: 'Máquinas Agrícolas',
            logo: '🚜',
            description: 'Inovação em plantadeiras e distribuidores de fertilizantes.',
            benefits: ['Condições especiais de pagamento', 'Suporte técnico', 'Garantia estendida'],
            tier: 'silver',
            website: 'stara.com.br',
            since: '2023'
        }
    ];

    const categories = ['all', 'Máquinas Agrícolas', 'Defensivos Agrícolas', 'Fertilizantes', 'Ferramentas', 'Pulverizadores'];

    const filteredPartners = selectedCategory === 'all'
        ? partners
        : partners.filter(p => p.category === selectedCategory);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'platinum': return 'from-slate-700 to-slate-900';
            case 'gold': return 'from-yellow-500 to-yellow-700';
            case 'silver': return 'from-gray-400 to-gray-600';
            default: return 'from-gray-500 to-gray-700';
        }
    };

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'platinum': return { text: 'Platinum', icon: '💎' };
            case 'gold': return { text: 'Gold', icon: '🥇' };
            case 'silver': return { text: 'Silver', icon: '🥈' };
            default: return { text: 'Partner', icon: '🤝' };
        }
    };

    const stats = [
        { icon: Users, label: 'Parceiros Ativos', value: partners.length, color: 'text-blue-600' },
        { icon: TrendingUp, label: 'Anos de Parceria', value: '4+', color: 'text-green-600' },
        { icon: Award, label: 'Benefícios Exclusivos', value: '25+', color: 'text-purple-600' },
        { icon: Globe, label: 'Países Atendidos', value: '12', color: 'text-orange-600' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-green-700 via-emerald-700 to-green-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative p-12 text-white">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-12 h-12" />
                            <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                                Programa de Parceiros Premium
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">
                            Grandes Marcas,<br />
                            <span className="text-green-200">Grandes Benefícios</span>
                        </h1>
                        <p className="text-xl text-green-100 mb-6 max-w-2xl">
                            Conectamos você às maiores empresas do agronegócio mundial. Descontos exclusivos,
                            suporte especializado e tecnologia de ponta ao seu alcance.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all flex items-center gap-2">
                                Ver Todos os Parceiros
                                <ArrowRight size={20} />
                            </button>
                            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all border-2 border-white/30">
                                Solicitar Parceria
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 ${stat.color} bg-opacity-10 rounded-xl`}>
                                <stat.icon className={stat.color} size={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Filtrar por Categoria</h3>
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-green-700 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat === 'all' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPartners.map((partner) => {
                    const tierBadge = getTierBadge(partner.tier);

                    return (
                        <div
                            key={partner.id}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            {/* Header com Tier */}
                            <div className={`bg-gradient-to-r ${getTierColor(partner.tier)} p-6 text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 text-9xl opacity-10 transform rotate-12">
                                    {partner.logo}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold flex items-center gap-1">
                                            {tierBadge.icon} {tierBadge.text} Partner
                                        </span>
                                        <span className="text-sm opacity-75">Desde {partner.since}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-6xl">{partner.logo}</div>
                                        <div>
                                            <h3 className="text-3xl font-bold">{partner.name}</h3>
                                            <p className="text-sm opacity-90">{partner.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {partner.description}
                                </p>

                                {/* Benefits */}
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Star className="text-yellow-500" size={18} />
                                        Benefícios Exclusivos
                                    </h4>
                                    <div className="space-y-2">
                                        {partner.benefits.map((benefit, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                                                <span className="text-sm text-gray-700">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <a
                                        href={`https://${partner.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-700 hover:text-green-800 font-medium flex items-center gap-1 text-sm"
                                    >
                                        <Globe size={16} />
                                        {partner.website}
                                    </a>
                                    <button className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-all flex items-center gap-2 text-sm font-medium">
                                        Saiba Mais
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-100">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-6">
                        <Users className="text-blue-700" size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Sua Empresa Também Pode Ser Parceira
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Junte-se às maiores marcas do agronegócio e alcance milhares de produtores rurais.
                        Oferecemos visibilidade, credibilidade e resultados reais.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button className="px-8 py-4 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg flex items-center gap-2">
                            <Award size={20} />
                            Tornar-se Parceiro
                        </button>
                        <button className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all border-2 border-blue-200">
                            Falar com Consultor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Partners;
