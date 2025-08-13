'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LoadingFallbackProps {
  scene?: THREE.Scene | null;
  performanceMode?: boolean;
}

// 3D Loading component for use within Three.js scene
export function LoadingFallback3D({ scene, performanceMode = false }: LoadingFallbackProps) {
  const spinnerRef = useRef<THREE.Group | null>(null);
  const spheresRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!scene) return;

    // Create main group for loading elements
    const loadingGroup = new THREE.Group();
    
    // Create spinner (rotating ring)
    const spinnerGroup = new THREE.Group();
    const ringGeometry = new THREE.RingGeometry(1, 1.2, performanceMode ? 16 : 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    spinnerGroup.add(ring);
    spinnerRef.current = spinnerGroup;
    
    // Create floating spheres
    const spheresGroup = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.1, performanceMode ? 8 : 16, performanceMode ? 8 : 16);
    
    for (let i = 0; i < (performanceMode ? 6 : 12); i++) {
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / 12, 0.7, 0.6),
        transparent: true,
        opacity: 0.8
      });
      
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const angle = (i / 12) * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * 2,
        Math.sin(angle) * 0.5,
        Math.sin(angle) * 2
      );
      sphere.userData.originalPosition = sphere.position.clone();
      sphere.userData.index = i;
      
      spheresGroup.add(sphere);
    }
    
    spheresRef.current = spheresGroup;
    
    // Add groups to main loading group
    loadingGroup.add(spinnerGroup);
    loadingGroup.add(spheresGroup);
    loadingGroup.position.set(0, 0, 0);
    
    // Add to scene
    scene.add(loadingGroup);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      // Animate spinner
      if (spinnerRef.current) {
        spinnerRef.current.rotation.y = elapsedTime * 2;
        spinnerRef.current.rotation.z = elapsedTime * 0.5;
      }

      // Animate spheres
      if (spheresRef.current) {
        spheresRef.current.children.forEach((sphere, index) => {
          if (sphere instanceof THREE.Mesh && sphere.userData.originalPosition) {
            const originalPos = sphere.userData.originalPosition;
            
            // Floating motion
            sphere.position.y = originalPos.y + Math.sin(elapsedTime * 2 + index * 0.5) * 0.3;
            
            // Orbital motion
            const angle = elapsedTime + index * 0.5;
            sphere.position.x = originalPos.x + Math.cos(angle) * 0.2;
            sphere.position.z = originalPos.z + Math.sin(angle) * 0.2;
            
            // Scale pulsing
            const scale = 1 + Math.sin(elapsedTime * 3 + index) * 0.2;
            sphere.scale.setScalar(scale);
            
            // Opacity pulsing
            if (sphere.material && 'opacity' in sphere.material) {
              const material = sphere.material as THREE.MeshBasicMaterial;
              material.opacity = 0.6 + Math.sin(elapsedTime * 4 + index) * 0.3;
            }
          }
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene && loadingGroup) {
        scene.remove(loadingGroup);
        
        // Dispose of geometries and materials
        loadingGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
      
      spinnerRef.current = null;
      spheresRef.current = null;
    };
  }, [scene, performanceMode]);

  return null;
}

// Traditional 2D loading fallback for UI overlay
export function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-50">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-r-2 border-green-400 absolute top-2 left-2" style={{ animationDuration: '1.5s' }}></div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 absolute top-4 left-4" style={{ animationDuration: '2s' }}></div>
        </div>
        
        {/* Loading text with typewriter effect */}
        <div className="space-y-2">
          <p className="text-lg font-semibold">Loading 3D Scene</p>
          <div className="flex justify-center space-x-1">
            <div className="animate-bounce h-2 w-2 bg-blue-400 rounded-full" style={{ animationDelay: '0ms' }}></div>
            <div className="animate-bounce h-2 w-2 bg-green-400 rounded-full" style={{ animationDelay: '150ms' }}></div>
            <div className="animate-bounce h-2 w-2 bg-yellow-400 rounded-full" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
          <div className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 h-2 rounded-full animate-pulse"></div>
        </div>
        
        <p className="text-sm text-gray-400 mt-4">
          Preparing your portfolio experience...
        </p>
      </div>
    </div>
  );
}

// Combined component that shows 2D fallback and optional 3D loading animation
interface CombinedLoadingProps {
  scene?: THREE.Scene | null;
  performanceMode?: boolean;
  show3D?: boolean;
}

export function CombinedLoading({ scene, performanceMode = false, show3D = false }: CombinedLoadingProps) {
  return (
    <>
      <LoadingFallback />
      {show3D && scene && (
        <LoadingFallback3D scene={scene} performanceMode={performanceMode} />
      )}
    </>
  );
}

// Standalone test component
export function StandaloneLoadingTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(75, 1.5, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(600, 400);

    sceneRef.current = scene;

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <button
          onClick={() => setShow3D(!show3D)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          3D Loading: {show3D ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setPerformanceMode(!performanceMode)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Performance Mode: {performanceMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} className="border rounded" />
        
        {/* Show the 2D loading overlay */}
        <LoadingFallback />
        
        {/* Show 3D loading animation in scene */}
        {show3D && (
          <LoadingFallback3D 
            scene={sceneRef.current} 
            performanceMode={performanceMode}
          />
        )}
      </div>
    </div>
  );
}