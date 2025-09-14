'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface AdvancedParticleSystemProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
}

export function AdvancedParticleSystem({
  scene,
  performanceMode = false,
}: AdvancedParticleSystemProps) {
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const nebulaRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const particleData = useMemo(() => {
    const count = performanceMode ? 3000 : 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Create a more realistic galaxy-like distribution
      const radius = Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50 + radius * Math.cos(phi) * 0.1;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Color based on distance and type
      const distance = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2
      );
      
      if (distance < 20) {
        // Core particles - bright white/blue
        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else if (distance < 50) {
        // Mid-range - tech colors
        const techColors = [
          [0.2, 0.8, 1.0], // Cyan
          [0.8, 0.2, 1.0], // Purple
          [0.2, 1.0, 0.4], // Green
          [1.0, 0.6, 0.2], // Orange
        ];
        const colorIndex = Math.floor(Math.random() * techColors.length);
        colors[i * 3] = techColors[colorIndex][0];
        colors[i * 3 + 1] = techColors[colorIndex][1];
        colors[i * 3 + 2] = techColors[colorIndex][2];
      } else {
        // Outer particles - dim white
        const intensity = 0.3 + Math.random() * 0.4;
        colors[i * 3] = intensity;
        colors[i * 3 + 1] = intensity;
        colors[i * 3 + 2] = intensity;
      }

      sizes[i] = Math.random() * 3 + 0.5;
      
      // Subtle orbital velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, velocities, phases, count };
  }, [performanceMode]);

  const nebulaData = useMemo(() => {
    const count = performanceMode ? 500 : 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Create nebula clouds
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 70;
      const height = (Math.random() - 0.5) * 20;
      
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 20;

      // Nebula colors - deep space theme
      const nebulaColors = [
        [0.1, 0.2, 0.8], // Deep blue
        [0.6, 0.1, 0.8], // Purple
        [0.1, 0.6, 0.8], // Teal
        [0.8, 0.3, 0.1], // Orange
      ];
      const colorIndex = Math.floor(Math.random() * nebulaColors.length);
      colors[i * 3] = nebulaColors[colorIndex][0];
      colors[i * 3 + 1] = nebulaColors[colorIndex][1];
      colors[i * 3 + 2] = nebulaColors[colorIndex][2];

      sizes[i] = 5 + Math.random() * 15;
    }

    return { positions, colors, sizes, count };
  }, [performanceMode]);

  useEffect(() => {
    if (!scene) return;

    // Create main particle system with advanced shader
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(particleData.sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(particleData.velocities, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(particleData.phases, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: performanceMode ? 3.0 : 6.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSize;
        
        attribute float size;
        attribute vec3 velocity;
        attribute float phase;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Orbital motion
          float time = uTime * 0.1;
          pos.x += sin(time + phase) * velocity.x * 10.0;
          pos.z += cos(time + phase) * velocity.z * 10.0;
          pos.y += sin(time * 0.5 + phase) * velocity.y * 5.0;
          
          // Pulsing effect
          float pulse = sin(uTime * 2.0 + phase) * 0.5 + 0.5;
          vAlpha = 0.3 + pulse * 0.7;
          
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectionPosition;
          
          // Size attenuation
          gl_PointSize = size * uSize * uPixelRatio;
          gl_PointSize *= (1.0 / -viewPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Create soft circular particles
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Soft edge with glow
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= vAlpha;
          
          // Add subtle glow
          float glow = 0.1 / (dist + 0.1);
          alpha += glow * 0.3;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.isAdvancedParticleSystem = true;
    particleSystemRef.current = particles;
    scene.add(particles);

    // Create nebula system
    const nebulaGeometry = new THREE.BufferGeometry();
    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaData.positions, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaData.colors, 3));
    nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaData.sizes, 1));

    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        
        attribute float size;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Slow drift motion
          pos.x += sin(uTime * 0.1 + position.z * 0.01) * 2.0;
          pos.y += cos(uTime * 0.05 + position.x * 0.01) * 1.0;
          
          // Breathing effect
          float breathe = sin(uTime * 0.3) * 0.5 + 0.5;
          vAlpha = 0.1 + breathe * 0.2;
          
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectionPosition;
          gl_PointSize = size * uPixelRatio * (1.0 / -viewPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Very soft, cloud-like appearance
          float alpha = 1.0 - smoothstep(0.0, 0.8, dist);
          alpha *= vAlpha;
          
          // Softer falloff for nebula effect
          alpha = pow(alpha, 2.0);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    nebula.userData.isNebula = true;
    nebulaRef.current = nebula;
    scene.add(nebula);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      if (material.uniforms) {
        material.uniforms.uTime.value = elapsedTime;
      }
      
      if (nebulaMaterial.uniforms) {
        nebulaMaterial.uniforms.uTime.value = elapsedTime;
      }

      // Slow rotation for the entire system
      if (particles) {
        particles.rotation.y = elapsedTime * 0.005;
        particles.rotation.x = Math.sin(elapsedTime * 0.003) * 0.1;
      }
      
      if (nebula) {
        nebula.rotation.y = elapsedTime * 0.002;
        nebula.rotation.z = Math.sin(elapsedTime * 0.001) * 0.05;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene) {
        if (particles) {
          scene.remove(particles);
          geometry.dispose();
          material.dispose();
        }
        if (nebula) {
          scene.remove(nebula);
          nebulaGeometry.dispose();
          nebulaMaterial.dispose();
        }
      }
      
      particleSystemRef.current = null;
      nebulaRef.current = null;
    };
  }, [scene, particleData, nebulaData, performanceMode]);

  return null;
}

// Data visualization particles for coding themes
export function CodeParticleSystem({
  scene,
  performanceMode = false,
}: AdvancedParticleSystemProps) {
  const systemRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    
    // Create binary code stream
    const createBinaryStream = () => {
      const count = performanceMode ? 200 : 500;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const speeds = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 50 - 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        // Green matrix-style color
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.2;

        sizes[i] = 1 + Math.random() * 2;
        speeds[i] = 0.5 + Math.random() * 1.5;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          
          attribute float size;
          attribute float speed;
          
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            vColor = color;
            
            vec3 pos = position;
            
            // Falling code effect
            pos.y -= mod(uTime * speed * 10.0, 50.0);
            if (pos.y < -25.0) pos.y += 50.0;
            
            // Flickering alpha
            vAlpha = 0.3 + sin(uTime * 5.0 + position.x) * 0.3;
            
            vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectionPosition = projectionMatrix * viewPosition;
            
            gl_Position = projectionPosition;
            gl_PointSize = size * 2.0 * uPixelRatio * (1.0 / -viewPosition.z);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          
          void main() {
            // Square pixels for digital look
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (abs(coord.x) > 0.4 || abs(coord.y) > 0.4) discard;
            
            gl_FragColor = vec4(vColor, vAlpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      });

      return new THREE.Points(geometry, material);
    };

    const binaryStream = createBinaryStream();
    binaryStream.userData.isBinaryStream = true;
    group.add(binaryStream);

    systemRef.current = group;
    scene.add(group);

    // Animation
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      group.children.forEach((child) => {
        if (child instanceof THREE.Points && child.material instanceof THREE.ShaderMaterial) {
          if (child.material.uniforms) {
            child.material.uniforms.uTime.value = elapsedTime;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene && group) {
        scene.remove(group);
        group.children.forEach((child) => {
          if (child instanceof THREE.Points) {
            child.geometry.dispose();
            if (child.material instanceof THREE.ShaderMaterial) {
              child.material.dispose();
            }
          }
        });
      }
      
      systemRef.current = null;
    };
  }, [scene, performanceMode]);

  return null;
}
