import React, { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Talhao3DProps {
    area: any;
    isSelected: boolean;
    onClick: () => void;
    timeProgress: number;
    viewMode: '3d' | 'terrain' | 'heatmap';
}

const Talhao3D: React.FC<Talhao3DProps> = ({
    area,
    isSelected,
    onClick,
    timeProgress,
    viewMode
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Converter coordenadas geográficas para posições 3D
    const { shape, center, bounds } = useMemo(() => {
        if (!area.coordinates || area.coordinates.length < 3) {
            return { shape: new THREE.Shape(), center: [0, 0, 0], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
        }

        const coords = area.coordinates;
        const shape = new THREE.Shape();

        // Calcular bounds
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        coords.forEach(([lat, lng]: [number, number]) => {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Escala para visualização (1 grau ≈ 111km, escala para metros)
        const scale = 10000;

        // Criar shape
        coords.forEach(([lat, lng]: [number, number], i: number) => {
            const x = (lng - centerLng) * scale;
            const y = (lat - centerLat) * scale;

            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        });
        shape.closePath();

        const centerX = 0;
        const centerY = 0;
        const centerZ = area.elevation || 0;

        return {
            shape,
            center: [centerX, centerZ, centerY],
            bounds: { minX: minLng, maxX: maxLng, minY: minLat, maxY: maxLat }
        };
    }, [area.coordinates, area.elevation]);

    // Cor baseada no modo de visualização
    const color = useMemo(() => {
        if (viewMode === 'heatmap') {
            // Mapa de calor baseado em stress hídrico
            const stress = area.waterStress || 0;
            if (stress < 25) return new THREE.Color('#3b82f6'); // Azul - bem irrigado
            if (stress < 50) return new THREE.Color('#22c55e'); // Verde - adequado
            if (stress < 75) return new THREE.Color('#eab308'); // Amarelo - atenção
            return new THREE.Color('#ef4444'); // Vermelho - crítico
        }

        // Cor baseada em saúde
        const health = area.health || 50;
        if (health >= 80) return new THREE.Color('#22c55e'); // Verde
        if (health >= 60) return new THREE.Color('#eab308'); // Amarelo
        if (health >= 40) return new THREE.Color('#f97316'); // Laranja
        return new THREE.Color('#ef4444'); // Vermelho
    }, [area.health, area.waterStress, viewMode]);

    // Altura baseada em produção e crescimento
    const height = useMemo(() => {
        const baseHeight = (area.production / 4000) * 10; // 0-10 unidades
        const growthMultiplier = 1 + (timeProgress / 100) * 0.5; // Cresce com o tempo
        return baseHeight * growthMultiplier;
    }, [area.production, timeProgress]);

    // Animação
    useFrame((state) => {
        if (!meshRef.current) return;

        // Pulsar quando selecionado
        if (isSelected) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            meshRef.current.scale.set(scale, 1, scale);
        } else if (hovered) {
            meshRef.current.scale.set(1.02, 1, 1.02);
        } else {
            meshRef.current.scale.set(1, 1, 1);
        }

        // Crescimento animado
        const targetHeight = height;
        const currentHeight = meshRef.current.scale.y;
        meshRef.current.scale.y = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.05);
    });

    // Geometria extrudada
    const extrudeSettings = useMemo(() => ({
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.1,
        bevelSegments: 3
    }), []);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <group position={center as [number, number, number]}>
            {/* Talhão 3D */}
            <mesh
                ref={meshRef}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                castShadow
                receiveShadow
            >
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial
                    color={color}
                    emissive={isSelected ? color : new THREE.Color('#000000')}
                    emissiveIntensity={isSelected ? 0.3 : 0}
                    roughness={0.7}
                    metalness={0.3}
                    transparent
                    opacity={hovered ? 0.9 : 0.85}
                />
            </mesh>

            {/* Borda destacada */}
            {(isSelected || hovered) && (
                <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                    <edgesGeometry args={[new THREE.ExtrudeGeometry(shape, extrudeSettings)]} />
                    <lineBasicMaterial
                        color={isSelected ? '#ffffff' : '#60a5fa'}
                        linewidth={2}
                    />
                </lineSegments>
            )}

            {/* Label 3D */}
            <Text
                position={[0, height + 2, 0]}
                fontSize={2}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.2}
                outlineColor="#000000"
            >
                {area.name}
            </Text>

            {/* Indicadores de status */}
            {isSelected && (
                <>
                    {/* Indicador de saúde */}
                    <mesh position={[-5, height + 1, 0]}>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={0.5}
                        />
                    </mesh>

                    {/* Partículas de água (se stress hídrico alto) */}
                    {area.waterStress > 60 && (
                        <points>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    count={50}
                                    array={new Float32Array(
                                        Array.from({ length: 150 }, () => (Math.random() - 0.5) * 10)
                                    )}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <pointsMaterial
                                size={0.2}
                                color="#3b82f6"
                                transparent
                                opacity={0.6}
                            />
                        </points>
                    )}
                </>
            )}

            {/* Efeito de crescimento (partículas) */}
            {timeProgress % 20 === 0 && (
                <points position={[0, height / 2, 0]}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={30}
                            array={new Float32Array(
                                Array.from({ length: 90 }, () => (Math.random() - 0.5) * 8)
                            )}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        color="#22c55e"
                        transparent
                        opacity={0.4}
                    />
                </points>
            )}
        </group>
    );
};

export default Talhao3D;
