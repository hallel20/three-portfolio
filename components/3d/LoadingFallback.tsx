'use client';

import { Text } from '@react-three/drei';

export function LoadingFallback() {
  return (
    <group>
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Loading Portfolio...
      </Text>
      
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
    </group>
  );
}