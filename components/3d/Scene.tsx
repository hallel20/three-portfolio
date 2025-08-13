'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { ProjectCards } from './ProjectCards';
import { ParticleBackground } from './ParticleBackground';
import { FloatingText } from './FloatingText';
import { LoadingFallback } from './LoadingFallback';
import { useUIStore } from '@/lib/store';

interface SceneProps {
  className?: string;
}

export default function Scene({ className = '' }: SceneProps) {
  const { performanceMode } = useUIStore();

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ 
          position: [0, 2, 8], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        shadows={!performanceMode}
        gl={{ 
          antialias: !performanceMode,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow={!performanceMode}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* 3D Content */}
          <FloatingText />
          <ProjectCards />
          {!performanceMode && <ParticleBackground />}
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
          
          {/* Performance Stats (dev only) */}
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </Canvas>
    </div>
  );
}