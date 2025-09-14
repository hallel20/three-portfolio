'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SkillVisualizationProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
}

interface Skill {
  name: string;
  level: number;
  color: string;
  category?: string;
}

const skillsData: Skill[] = [
  { name: 'JavaScript', level: 95, color: '#F7DF1E', category: 'frontend' },
  { name: 'TypeScript', level: 90, color: '#3178C6', category: 'frontend' },
  { name: 'React', level: 92, color: '#61DAFB', category: 'frontend' },
  { name: 'Node.js', level: 88, color: '#339933', category: 'backend' },
  { name: 'Python', level: 85, color: '#3776AB', category: 'backend' },
  { name: 'AWS', level: 82, color: '#FF9900', category: 'cloud' },
  { name: 'Docker', level: 80, color: '#2496ED', category: 'devops' },
  { name: 'GraphQL', level: 85, color: '#E10098', category: 'backend' },
  { name: 'Three.js', level: 78, color: '#000000', category: 'frontend' },
  { name: 'MongoDB', level: 83, color: '#47A248', category: 'database' },
];

export function SkillVisualization({
  scene,
  performanceMode = false,
}: SkillVisualizationProps) {
  const skillGroupRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const createSkillOrb = useCallback((skill: Skill, index: number) => {
    const orbGroup = new THREE.Group();
    
    // Core orb
    const orbGeometry = new THREE.SphereGeometry(0.3, performanceMode ? 16 : 32, performanceMode ? 16 : 32);
    const orbMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(skill.color) },
        uLevel: { value: skill.level / 100 },
        uIndex: { value: index },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uLevel;
        uniform float uIndex;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vLevel;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vLevel = uLevel;
          
          vec3 pos = position;
          
          // Pulsing based on skill level
          float pulse = sin(uTime * 2.0 + uIndex) * 0.1 * uLevel;
          pos *= (1.0 + pulse);
          
          // Energy waves
          float wave = sin(uTime * 3.0 + length(position) * 5.0) * 0.02;
          pos += normal * wave * uLevel;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uLevel;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vLevel;
        
        void main() {
          // Fresnel effect
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          // Energy core
          float core = 1.0 - length(vPosition) * 0.5;
          core = pow(core, 2.0) * vLevel;
          
          // Pulsing intensity
          float pulse = sin(uTime * 4.0) * 0.3 + 0.7;
          
          vec3 finalColor = uColor * (fresnel + core) * pulse;
          float alpha = (fresnel * 0.8 + core) * vLevel;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orbGroup.add(orb);
    
    // Progress ring
    const ringGeometry = new THREE.RingGeometry(0.4, 0.45, 32);
    const ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(skill.color) },
        uProgress: { value: skill.level / 100 },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          pos.z += sin(uTime * 2.0 + atan(position.y, position.x) * 4.0) * 0.02;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uProgress;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Calculate angle for progress
          float angle = atan(vPosition.y, vPosition.x);
          angle = (angle + 3.14159) / (2.0 * 3.14159); // Normalize to 0-1
          
          // Progress fill
          float progress = step(angle, uProgress);
          
          // Animated scanning line
          float scanLine = smoothstep(0.02, 0.0, abs(angle - uProgress));
          scanLine *= sin(uTime * 8.0) * 0.5 + 0.5;
          
          // Glow effect
          float glow = 1.0 - smoothstep(0.0, 0.1, length(vUv - vec2(0.5)));
          
          vec3 finalColor = uColor * (progress + scanLine * 2.0);
          float alpha = (progress * 0.6 + scanLine + glow * 0.3) * 0.8;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    orbGroup.add(ring);
    
    // Skill label
    const labelCanvas = document.createElement('canvas');
    const labelContext = labelCanvas.getContext('2d');
    if (labelContext) {
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      
      labelContext.fillStyle = 'rgba(0, 0, 0, 0)';
      labelContext.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
      
      labelContext.fillStyle = '#ffffff';
      labelContext.font = 'bold 18px monospace';
      labelContext.textAlign = 'center';
      labelContext.textBaseline = 'middle';
      labelContext.fillText(skill.name, labelCanvas.width / 2, labelCanvas.height / 2 - 8);
      
      labelContext.font = '14px monospace';
      labelContext.fillText(`${skill.level}%`, labelCanvas.width / 2, labelCanvas.height / 2 + 12);
      
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.9,
      });
      
      const labelGeometry = new THREE.PlaneGeometry(1.2, 0.3);
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.set(0, -0.8, 0);
      
      orbGroup.add(labelMesh);
    }
    
    // Data particles around the orb
    const particleCount = Math.floor(skill.level / 10);
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.3;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const color = new THREE.Color(skill.color);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData.isSkillParticles = true;
    orbGroup.add(particles);
    
    orbGroup.userData = { skill, index };
    return orbGroup;
  }, [performanceMode]);

  const createSkillChart = () => {
    const chartGroup = new THREE.Group();
    
    // Create 3D bar chart for skill categories
    const categories = [...new Set(skillsData.map(skill => skill.category))];
    const categoryData = categories.map(category => {
      const categorySkills = skillsData.filter(skill => skill.category === category);
      const avgLevel = categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length;
      return { category, level: avgLevel, count: categorySkills.length };
    });
    
    categoryData.forEach((data, index) => {
      const barHeight = (data.level / 100) * 3;
      const barGeometry = new THREE.BoxGeometry(0.4, barHeight, 0.4);
      const barMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uHeight: { value: barHeight },
          uIndex: { value: index },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uHeight;
          uniform float uIndex;
          
          varying vec3 vPosition;
          varying float vHeight;
          
          void main() {
            vPosition = position;
            vHeight = uHeight;
            
            vec3 pos = position;
            
            // Growing animation
            float growth = sin(uTime * 0.5 + uIndex) * 0.1 + 0.9;
            pos.y *= growth;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          
          varying vec3 vPosition;
          varying float vHeight;
          
          void main() {
            // Height-based color gradient
            float heightRatio = (vPosition.y + vHeight * 0.5) / vHeight;
            
            vec3 bottomColor = vec3(0.2, 0.4, 1.0);
            vec3 topColor = vec3(1.0, 0.4, 0.2);
            vec3 color = mix(bottomColor, topColor, heightRatio);
            
            // Pulsing effect
            float pulse = sin(uTime * 3.0) * 0.2 + 0.8;
            color *= pulse;
            
            gl_FragColor = vec4(color, 0.8);
          }
        `,
        transparent: true,
      });
      
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.set(
        (index - categoryData.length / 2) * 1.2,
        barHeight / 2,
        -8
      );
      
      // Category label
      const labelCanvas = document.createElement('canvas');
      const labelContext = labelCanvas.getContext('2d');
      if (labelContext) {
        labelCanvas.width = 128;
        labelCanvas.height = 32;
        
        labelContext.fillStyle = '#ffffff';
        labelContext.font = '14px monospace';
        labelContext.textAlign = 'center';
        labelContext.textBaseline = 'middle';
        labelContext.fillText(data.category || 'other', 64, 16);
        
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
        });
        
        const labelGeometry = new THREE.PlaneGeometry(0.8, 0.2);
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.set(
          (index - categoryData.length / 2) * 1.2,
          -0.3,
          -8
        );
        
        chartGroup.add(labelMesh);
      }
      
      chartGroup.add(bar);
    });
    
    return chartGroup;
  };

  useEffect(() => {
    if (!scene) return;

    const mainGroup = new THREE.Group();
    skillGroupRef.current = mainGroup;

    // Create skill orbs in a circular arrangement
    skillsData.forEach((skill, index) => {
      const skillOrb = createSkillOrb(skill, index);
      
      // Arrange in a spiral
      const angle = (index / skillsData.length) * Math.PI * 2 * 2;
      const radius = 3 + (index % 3) * 1.5;
      const height = Math.sin(index * 0.8) * 2;
      
      skillOrb.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      skillOrb.userData.originalPosition = skillOrb.position.clone();
      skillOrb.userData.angle = angle;
      skillOrb.userData.radius = radius;
      
      mainGroup.add(skillOrb);
    });

    // Add skill chart
    const chart = createSkillChart();
    mainGroup.add(chart);

    scene.add(mainGroup);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      mainGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Group && child.userData.skill) {
          const userData = child.userData;
          const originalPos = userData.originalPosition;
          
          // Orbital motion
          const newAngle = userData.angle + elapsedTime * 0.1;
          child.position.x = Math.cos(newAngle) * userData.radius;
          child.position.z = Math.sin(newAngle) * userData.radius;
          child.position.y = originalPos.y + Math.sin(elapsedTime * 0.5 + index) * 0.3;
          
          // Rotation
          child.rotation.y = elapsedTime * 0.5 + index;
          
          // Update shader uniforms
          child.traverse((mesh) => {
            if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.ShaderMaterial) {
              if (mesh.material.uniforms && mesh.material.uniforms.uTime) {
                mesh.material.uniforms.uTime.value = elapsedTime;
              }
            }
            
            // Animate skill particles
            if (mesh instanceof THREE.Points && mesh.userData.isSkillParticles) {
              mesh.rotation.y = elapsedTime * 0.5;
              mesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
            }
          });
        }
        
        // Animate chart bars
        if (child instanceof THREE.Group && !child.userData.skill) {
          child.children.forEach((bar) => {
            if (bar instanceof THREE.Mesh && bar.material instanceof THREE.ShaderMaterial) {
              if (bar.material.uniforms && bar.material.uniforms.uTime) {
                bar.material.uniforms.uTime.value = elapsedTime;
              }
            }
          });
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (scene && mainGroup) {
        scene.remove(mainGroup);
        
        // Dispose of all resources
        mainGroup.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              } else {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
              }
            }
          }
        });
      }
      
      skillGroupRef.current = null;
    };
  }, [scene, performanceMode, createSkillOrb]);

  return null;
}
