'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function FloatingText() {
  const titleRef = useRef<THREE.Mesh>(null);
  const subtitleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (titleRef.current) {
      titleRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
    if (subtitleRef.current) {
      subtitleRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime + 0.5) * 0.08;
    }
  });

  return (
    <group>
      <Text
        ref={titleRef}
        position={[0, 3, -2]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Alex Developer
      </Text>
      
      <Text
        ref={subtitleRef}
        position={[0, 2, -2]}
        fontSize={0.3}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        Full Stack Developer & Tech Lead
      </Text>

      {/* Decorative elements */}
      <mesh position={[-4, 2.5, -3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.2} />
      </mesh>
      
      <mesh position={[4, 2.5, -3]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}