'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

interface ParticleBackgroundProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
  count?: number;
  size?: number;
  speed?: number;
  colors?: string[];
  opacity?: number;
}

export function ParticleBackground({
  scene,
  performanceMode = false,
  count = 5000, // Increased count for a denser star field
  size = 0.8,
  speed = 1,
  colors = ["#ffffff"], // Set color to white for a classic star look
  opacity = 1.0, // Increased opacity for brighter stars
}: ParticleBackgroundProps) {
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const particleData = useMemo(() => {
    const particleCount = performanceMode ? Math.min(count, 1000) : count;
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorObjects = colors.map(color => new THREE.Color(color));

    for (let i = 0; i < particleCount; i++) {
      // Position particles randomly in a larger box for a more expansive feel
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      // Color - randomly pick from the single white color
      const colorIndex = Math.floor(Math.random() * colorObjects.length);
      const color = colorObjects[colorIndex];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      // Size variation for a more realistic star-like appearance
      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    return { positions, colors: particleColors, sizes, count: particleCount };
  }, [count, colors, performanceMode]);

  useEffect(() => {
    if (!scene) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(particleData.sizes, 1));

    const material = new THREE.PointsMaterial({
      transparent: true,
      vertexColors: true,
      size: size,
      sizeAttenuation: true,
      depthWrite: false,
      opacity: opacity,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.isParticleBackground = true;
    particleSystemRef.current = particleSystem;

    scene.add(particleSystem);

    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      if (particleSystem) {
        // Rotation animation
        particleSystem.rotation.x = elapsedTime * 0.01 * speed; // Slower rotation
        particleSystem.rotation.y = elapsedTime * 0.02 * speed; // Slower rotation

        // Removed the subtle floating motion for a more static, celestial feel
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene && particleSystem) {
        scene.remove(particleSystem);
        geometry.dispose();
        material.dispose();
      }
      
      particleSystemRef.current = null;
    };
  }, [scene, particleData, size, speed, opacity, performanceMode]);

  return null;
}

// Advanced version with custom shader for better performance and effects
interface AdvancedParticleBackgroundProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
  count?: number;
}

export function AdvancedParticleBackground({
  scene,
  performanceMode = false,
  count = 5000,
}: AdvancedParticleBackgroundProps) {
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const particleData = useMemo(() => {
    const particleCount = performanceMode ? Math.min(count, 2000) : count;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color("#3B82F6"),
      new THREE.Color("#10B981"),
      new THREE.Color("#F59E0B"),
      new THREE.Color("#EF4444"),
      new THREE.Color("#8B5CF6"),
    ];

    for (let i = 0; i < particleCount; i++) {
      // Create a more interesting spherical distribution
      const radius = Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = Math.random();
    }

    return { positions, colors, scales, count: particleCount };
  }, [count, performanceMode]);

  useEffect(() => {
    if (!scene) return;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(particleData.scales, 1));

    // Create shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: performanceMode ? 4.0 : 8.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute float scale;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Add wave motion
          pos.y += sin(uTime + position.x * 0.01) * 2.0;
          pos.x += cos(uTime + position.y * 0.01) * 1.0;
          
          // Additional swirling motion
          float angle = uTime * 0.5 + length(position.xz) * 0.02;
          pos.x += sin(angle) * 0.5;
          pos.z += cos(angle) * 0.5;
          
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectionPosition;
          
          // Size attenuation
          float sizeAttenuation = 1.0 / -viewPosition.z;
          gl_PointSize = uSize * scale * sizeAttenuation;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create circular particles with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(center);
          
          // Soft circular shape
          float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          
          // Add some glow effect
          float glow = 0.1 / (distanceToCenter + 0.1);
          strength += glow * 0.3;
          
          // Pulsing effect
          strength *= 0.8 + 0.2 * sin(gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01);
          
          gl_FragColor = vec4(vColor, strength * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    shaderMaterialRef.current = shaderMaterial;

    // Create particle system
    const particleSystem = new THREE.Points(geometry, shaderMaterial);
    particleSystem.userData.isAdvancedParticleBackground = true;
    particleSystemRef.current = particleSystem;

    // Add to scene
    scene.add(particleSystem);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      if (shaderMaterial) {
        shaderMaterial.uniforms.uTime.value = elapsedTime;
      }

      if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.02;
        particleSystem.rotation.x = elapsedTime * 0.01;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene && particleSystem) {
        scene.remove(particleSystem);
        geometry.dispose();
        shaderMaterial.dispose();
      }
      
      particleSystemRef.current = null;
      shaderMaterialRef.current = null;
    };
  }, [scene, particleData, performanceMode]);

  return null;
}

// Standalone test component
export function StandaloneParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: !performanceMode 
    });
    
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
  }, [performanceMode]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAdvanced ? 'Basic Particles' : 'Advanced Particles'}
        </button>
        <button
          onClick={() => setPerformanceMode(!performanceMode)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Performance Mode: {performanceMode ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <canvas ref={canvasRef} className="border rounded" />
      
      {showAdvanced ? (
        <AdvancedParticleBackground 
          scene={sceneRef.current} 
          performanceMode={performanceMode}
          count={3000}
        />
      ) : (
        <ParticleBackground 
          scene={sceneRef.current} 
          performanceMode={performanceMode}
          count={1500}
        />
      )}
    </div>
  );
}