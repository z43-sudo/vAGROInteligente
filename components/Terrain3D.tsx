import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Terrain3DProps {
    size?: number;
}

const Terrain3D: React.FC<Terrain3DProps> = ({ size = 200 }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Gerar geometria do terreno com elevação
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(size, size, 100, 100);
        const positions = geo.attributes.position.array;

        // Adicionar elevação usando ruído Perlin simplificado
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];

            // Criar ondulações no terreno
            const elevation =
                Math.sin(x * 0.05) * 3 +
                Math.cos(y * 0.05) * 3 +
                Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2 +
                Math.random() * 0.5;

            positions[i + 2] = elevation;
        }

        geo.computeVertexNormals();
        return geo;
    }, [size]);

    // Textura do terreno
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Gradiente de terra
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(0.5, '#3d6b1f');
        gradient.addColorStop(1, '#4d7c2f');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Adicionar textura de grama
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${150 + Math.random() * 50}, ${50 + Math.random() * 30}, 0.3)`;
            ctx.fillRect(x, y, 2, 2);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
    }, []);

    // Animação sutil
    useFrame((state) => {
        if (meshRef.current) {
            // Leve movimento de respiração
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
            receiveShadow
        >
            <primitive object={geometry} />
            <meshStandardMaterial
                map={texture}
                roughness={0.8}
                metalness={0.2}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default Terrain3D;
