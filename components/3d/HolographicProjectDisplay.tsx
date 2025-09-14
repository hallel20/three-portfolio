'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePortfolioStore } from '@/lib/store';

interface HolographicProjectDisplayProps {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  canvas: HTMLCanvasElement | null;
  performanceMode?: boolean;
}

export function HolographicProjectDisplay({
  scene,
  camera,
  canvas,
  performanceMode = false,
}: HolographicProjectDisplayProps) {
  const hologramGroupRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const { projects, setSelectedProject } = usePortfolioStore();

  const createHolographicFrame = (width: number, height: number, color: string) => {
    const frameGroup = new THREE.Group();
    
    // Create holographic border effect
    const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height));
    const borderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          vec3 pos = position;
          
          // Subtle wave animation
          pos.z += sin(uTime * 2.0 + position.x * 0.5) * 0.02;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vPosition;
        
        void main() {
          // Pulsing glow effect
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          
          // Edge glow based on position
          float edgeGlow = 1.0 - smoothstep(0.0, 0.1, abs(vPosition.x)) * 
                          (1.0 - smoothstep(0.0, 0.1, abs(vPosition.y)));
          
          vec3 finalColor = uColor * (pulse + edgeGlow);
          gl_FragColor = vec4(finalColor, 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
    frameGroup.add(borderLines);
    
    // Add corner markers
    const cornerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const cornerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
    });
    
    const corners = [
      [-width/2, -height/2, 0],
      [width/2, -height/2, 0],
      [width/2, height/2, 0],
      [-width/2, height/2, 0],
    ];
    
    corners.forEach(([x, y, z]) => {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
      corner.position.set(x, y, z);
      frameGroup.add(corner);
    });
    
    return frameGroup;
  };

  const createCodeVisualization = (project: any) => {
    const codeGroup = new THREE.Group();
    
    // Create floating code blocks
    const technologies = project.technologies || [];
    technologies.forEach((tech: string, index: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.width = 256;
      canvas.height = 64;
      
      // Create tech badge background
      context.fillStyle = 'rgba(0, 20, 40, 0.9)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add border
      context.strokeStyle = project.color || '#3B82F6';
      context.lineWidth = 2;
      context.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      context.fillStyle = '#ffffff';
      context.font = 'bold 20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(tech, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
      });
      
      const geometry = new THREE.PlaneGeometry(1, 0.25);
      const techMesh = new THREE.Mesh(geometry, material);
      
      // Position tech badges in a spiral
      const angle = (index / technologies.length) * Math.PI * 2;
      const radius = 1.5;
      techMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        0.1
      );
      
      techMesh.userData.originalPosition = techMesh.position.clone();
      techMesh.userData.index = index;
      
      codeGroup.add(techMesh);
    });
    
    return codeGroup;
  };

  const createProjectMetrics = () => {
    const metricsGroup = new THREE.Group();
    
    // Create animated progress bars for different metrics
    const metrics = [
      { label: 'Complexity', value: 0.8, color: '#3B82F6' },
      { label: 'Innovation', value: 0.9, color: '#10B981' },
      { label: 'Impact', value: 0.7, color: '#F59E0B' },
    ];
    
    metrics.forEach((metric, index) => {
      // Background bar
      const bgGeometry = new THREE.PlaneGeometry(2, 0.1);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.5,
      });
      const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
      bgBar.position.set(0, -index * 0.3 - 1, 0);
      
      // Progress bar with shader
      const progressGeometry = new THREE.PlaneGeometry(2 * metric.value, 0.08);
      const progressMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(metric.color) },
          uProgress: { value: metric.value },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uProgress;
          varying vec2 vUv;
          
          void main() {
            // Animated fill effect
            float fill = smoothstep(0.0, 1.0, vUv.x);
            
            // Pulsing glow
            float pulse = sin(uTime * 4.0) * 0.2 + 0.8;
            
            // Scanning line effect
            float scan = sin(vUv.x * 10.0 - uTime * 5.0) * 0.1 + 0.9;
            
            vec3 finalColor = uColor * pulse * scan;
            gl_FragColor = vec4(finalColor, 0.8);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      
      const progressBar = new THREE.Mesh(progressGeometry, progressMaterial);
      progressBar.position.set(-1 + metric.value, -index * 0.3 - 1, 0.01);
      progressBar.userData.isMetricBar = true;
      
      // Label
      const labelCanvas = document.createElement('canvas');
      const labelContext = labelCanvas.getContext('2d');
      if (labelContext) {
        labelCanvas.width = 128;
        labelCanvas.height = 32;
        
        labelContext.fillStyle = '#ffffff';
        labelContext.font = '16px monospace';
        labelContext.textAlign = 'left';
        labelContext.textBaseline = 'middle';
        labelContext.fillText(metric.label, 0, 16);
        
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
        });
        
        const labelGeometry = new THREE.PlaneGeometry(0.8, 0.2);
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.set(-1.5, -index * 0.3 - 1, 0);
        
        metricsGroup.add(labelMesh);
      }
      
      metricsGroup.add(bgBar);
      metricsGroup.add(progressBar);
    });
    
    return metricsGroup;
  };

  useEffect(() => {
    if (!scene || !camera || !canvas || projects.length === 0) return;

    const mainGroup = new THREE.Group();
    hologramGroupRef.current = mainGroup;

    projects.forEach((project, index) => {
      const projectGroup = new THREE.Group();
      
      // Position projects in a 3D layout
      const angle = (index / projects.length) * Math.PI * 2;
      const radius = 8;
      projectGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(index * 0.5) * 2,
        Math.sin(angle) * radius
      );
      
      // Create holographic frame
      const frame = createHolographicFrame(3, 4, project.color || '#3B82F6');
      projectGroup.add(frame);
      
      // Create project title
      const titleCanvas = document.createElement('canvas');
      const titleContext = titleCanvas.getContext('2d');
      if (titleContext) {
        titleCanvas.width = 512;
        titleCanvas.height = 64;
        
        titleContext.fillStyle = 'rgba(0, 0, 0, 0)';
        titleContext.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
        
        titleContext.fillStyle = '#ffffff';
        titleContext.font = 'bold 24px monospace';
        titleContext.textAlign = 'center';
        titleContext.textBaseline = 'middle';
        titleContext.fillText(project.title, titleCanvas.width / 2, titleCanvas.height / 2);
        
        const titleTexture = new THREE.CanvasTexture(titleCanvas);
        const titleMaterial = new THREE.MeshBasicMaterial({
          map: titleTexture,
          transparent: true,
        });
        
        const titleGeometry = new THREE.PlaneGeometry(2.5, 0.3);
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(0, 1.5, 0.1);
        
        projectGroup.add(titleMesh);
      }
      
      // Add code visualization
      const codeViz = createCodeVisualization(project);
      codeViz.position.set(0, 0.5, 0.1);
      projectGroup.add(codeViz);
      
      // Add project metrics
      const metrics = createProjectMetrics();
      metrics.position.set(0, -0.5, 0.1);
      projectGroup.add(metrics);
      
      // Store project data for interaction
      projectGroup.userData = {
        project,
        index,
        originalPosition: projectGroup.position.clone(),
        originalRotation: projectGroup.rotation.clone(),
      };
      
      mainGroup.add(projectGroup);
    });

    scene.add(mainGroup);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredProject: THREE.Group | null = null;

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(mainGroup.children, true);

      if (intersects.length > 0) {
        let projectGroup = intersects[0].object.parent;
        while (projectGroup && projectGroup.parent !== mainGroup) {
          projectGroup = projectGroup.parent;
        }
        
        if (projectGroup && projectGroup !== hoveredProject) {
          hoveredProject = projectGroup as THREE.Group;
          canvas.style.cursor = 'pointer';
        }
      } else {
        hoveredProject = null;
        canvas.style.cursor = 'default';
      }
    };

    const onClick = () => {
      if (hoveredProject && hoveredProject.userData.project) {
        setSelectedProject(hoveredProject.userData.project);
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      mainGroup.children.forEach((projectGroup, index) => {
        if (projectGroup instanceof THREE.Group) {
          const userData = projectGroup.userData;
          const isHovered = projectGroup === hoveredProject;
          
          // Floating animation
          projectGroup.position.y = userData.originalPosition.y + 
            Math.sin(elapsedTime * 0.5 + index) * 0.2;
          
          // Rotation animation
          projectGroup.rotation.y = userData.originalRotation.y + 
            elapsedTime * 0.1 + index * 0.1;
          
          // Hover effects
          const targetScale = isHovered ? 1.1 : 1.0;
          projectGroup.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.1
          );
          
          // Update shader uniforms
          projectGroup.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
              if (child.material instanceof THREE.ShaderMaterial && child.material.uniforms) {
                if (child.material.uniforms.uTime) {
                  child.material.uniforms.uTime.value = elapsedTime;
                }
              }
            }
          });
          
          // Animate tech badges
          projectGroup.children.forEach((child) => {
            if (child instanceof THREE.Group) {
              child.children.forEach((techMesh) => {
                if (techMesh.userData.originalPosition) {
                  const originalPos = techMesh.userData.originalPosition;
                  const index = techMesh.userData.index || 0;
                  
                  techMesh.position.y = originalPos.y + 
                    Math.sin(elapsedTime * 2 + index * 0.5) * 0.1;
                  techMesh.rotation.z = Math.sin(elapsedTime + index) * 0.1;
                }
              });
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
      
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      
      if (scene && mainGroup) {
        scene.remove(mainGroup);
        
        // Dispose of all geometries and materials
        mainGroup.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
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
      
      hologramGroupRef.current = null;
    };
  }, [scene, camera, canvas, projects, performanceMode, setSelectedProject]);

  return null;
}
