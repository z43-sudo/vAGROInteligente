import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Calendar } from 'lucide-react';

interface TimelineControlProps {
    progress: number;
    isPlaying: boolean;
    onProgressChange: (progress: number) => void;
    onPlayPause: () => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
    progress,
    isPlaying,
    onProgressChange,
    onPlayPause
}) => {
    const getDayFromProgress = (progress: number) => {
        return Math.floor((progress / 100) * 120); // 120 dias de ciclo
    };

    const getMonthFromDay = (day: number) => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const startMonth = 9; // Setembro (início comum de plantio)
        const monthIndex = (startMonth + Math.floor(day / 30)) % 12;
        return months[monthIndex];
    };

    const currentDay = getDayFromProgress(progress);
    const currentMonth = getMonthFromDay(currentDay);

    return (
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="text-blue-400" size={20} />
                    <h3 className="text-white font-semibold">Linha do Tempo de Crescimento</h3>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                    <span className="text-white text-sm font-semibold">
                        Dia {currentDay} - {currentMonth}
                    </span>
                </div>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-3">
                {/* Progress Bar */}
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => onProgressChange(Number(e.target.value))}
                        className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`
                        }}
                    />

                    {/* Markers */}
                    <div className="absolute top-5 left-0 right-0 flex justify-between px-1">
                        {[0, 25, 50, 75, 100].map((mark) => (
                            <div key={mark} className="flex flex-col items-center">
                                <div className="w-0.5 h-2 bg-white/40" />
                                <span className="text-xs text-blue-200 mt-1">
                                    {Math.floor((mark / 100) * 120)}d
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Stages */}
                <div className="flex justify-between text-xs text-white mt-8">
                    {[
                        { name: 'Germinação', range: '0-20d' },
                        { name: 'Vegetativo', range: '20-50d' },
                        { name: 'Floração', range: '50-80d' },
                        { name: 'Enchimento', range: '80-100d' },
                        { name: 'Maturação', range: '100-120d' }
                    ].map((stage, index) => {
                        const stageProgress = (index * 20);
                        const isActive = progress >= stageProgress && progress < stageProgress + 20;

                        return (
                            <div
                                key={stage.name}
                                className={`flex-1 text-center p-2 rounded-lg transition-all ${isActive ? 'bg-blue-600 shadow-lg' : 'bg-white/10'
                                    }`}
                            >
                                <p className="font-semibold">{stage.name}</p>
                                <p className="text-xs text-blue-200">{stage.range}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                        onClick={() => onProgressChange(0)}
                        className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors text-white"
                        title="Voltar ao início"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={onPlayPause}
                        className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl transition-colors text-white shadow-lg"
                        title={isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <button
                        onClick={() => onProgressChange(100)}
                        className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors text-white"
                        title="Ir para o final"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-xs text-blue-200">Velocidade:</span>
                    {['0.5x', '1x', '2x', '4x'].map((speed) => (
                        <button
                            key={speed}
                            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors text-white"
                        >
                            {speed}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimelineControl;
