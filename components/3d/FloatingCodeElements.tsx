'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface FloatingCodeElementsProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
}

export function FloatingCodeElements({
  scene,
  performanceMode = false,
}: FloatingCodeElementsProps) {
  const codeGroupRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const codeSnippets = useMemo(() => [
    {
      title: 'React Component',
      code: `const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    fetchProjects().then(setProjects);
  }, []);
  
  return (
    <div className="portfolio">
      {projects.map(project => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
};`,
      language: 'javascript',
      color: '#61DAFB'
    },
    {
      title: 'GraphQL Query',
      code: `query GetProjects($filter: String) {
  projects(filter: $filter) {
    id
    title
    description
    technologies
    githubUrl
    liveUrl
    createdAt
  }
}`,
      language: 'graphql',
      color: '#E10098'
    },
    {
      title: 'Docker Configuration',
      code: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
      language: 'dockerfile',
      color: '#2496ED'
    },
    {
      title: 'Python Algorithm',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
      language: 'python',
      color: '#3776AB'
    }
  ], []);

  const terminalCommands = useMemo(() => [
    {
      title: 'Git Workflow',
      commands: [
        '$ git checkout -b feature/new-component',
        '$ git add .',
        '$ git commit -m "Add interactive 3D portfolio"',
        '$ git push origin feature/new-component',
        '$ gh pr create --title "3D Portfolio Enhancement"'
      ],
      color: '#F14E32'
    },
    {
      title: 'Docker Deploy',
      commands: [
        '$ docker build -t portfolio:latest .',
        '$ docker tag portfolio:latest registry/portfolio:v1.2.0',
        '$ docker push registry/portfolio:v1.2.0',
        '$ kubectl apply -f deployment.yaml',
        '$ kubectl get pods -l app=portfolio'
      ],
      color: '#2496ED'
    },
    {
      title: 'Performance Analysis',
      commands: [
        '$ npm run build',
        '$ npm run analyze',
        'Bundle size: 2.3MB → 1.8MB (-22%)',
        '$ lighthouse --chrome-flags="--headless"',
        'Performance: 98/100 ✅'
      ],
      color: '#10B981'
    }
  ], []);

  const createCodeWindow = (snippet: any, index: number) => {
    const windowGroup = new THREE.Group();
    
    // Window frame
    const frameWidth = 4;
    const frameHeight = 3;
    const frameDepth = 0.1;
    
    // Background
    const bgGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.9,
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.z = -frameDepth / 2;
    windowGroup.add(background);
    
    // Frame border with glow effect
    const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(frameWidth, frameHeight));
    const borderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(snippet.color) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          vec3 pos = position;
          
          // Subtle pulse animation
          pos *= 1.0 + sin(uTime * 2.0) * 0.01;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vPosition;
        
        void main() {
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          gl_FragColor = vec4(uColor * pulse, 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    windowGroup.add(border);
    
    // Title bar
    const titleBarGeometry = new THREE.PlaneGeometry(frameWidth, 0.3);
    const titleBarMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(snippet.color).multiplyScalar(0.3),
      transparent: true,
      opacity: 0.8,
    });
    const titleBar = new THREE.Mesh(titleBarGeometry, titleBarMaterial);
    titleBar.position.set(0, frameHeight / 2 - 0.15, 0);
    windowGroup.add(titleBar);
    
    // Window controls (close, minimize, maximize)
    const controlColors = [0xff5f57, 0xffbd2e, 0x28ca42];
    controlColors.forEach((color, i) => {
      const controlGeometry = new THREE.CircleGeometry(0.05, 8);
      const controlMaterial = new THREE.MeshBasicMaterial({ color });
      const control = new THREE.Mesh(controlGeometry, controlMaterial);
      control.position.set(-frameWidth / 2 + 0.2 + i * 0.15, frameHeight / 2 - 0.15, 0.01);
      windowGroup.add(control);
    });
    
    // Code content
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 1024;
      canvas.height = 768;
      
      // Background
      context.fillStyle = '#1a1a1a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      context.fillStyle = '#ffffff';
      context.font = 'bold 24px monospace';
      context.fillText(snippet.title, 20, 40);
      
      // Code with syntax highlighting colors
      const lines = snippet.code.split('\n');
      context.font = '18px monospace';
      
      lines.forEach((line: string, lineIndex: number) => {
        const y = 80 + lineIndex * 25;
        
        // Line numbers
        context.fillStyle = '#666666';
        context.fillText(`${lineIndex + 1}`.padStart(2, ' '), 20, y);
        
        // Code content with basic syntax highlighting
        context.fillStyle = getCodeColor(line);
        context.fillText(line, 60, y);
      });
      
      const texture = new THREE.CanvasTexture(canvas);
      const codeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
      });
      
      const codeGeometry = new THREE.PlaneGeometry(frameWidth - 0.2, frameHeight - 0.5);
      const codeMesh = new THREE.Mesh(codeGeometry, codeMaterial);
      codeMesh.position.set(0, -0.1, 0.01);
      
      windowGroup.add(codeMesh);
    }
    
    // Floating particles around the window
    const particleCount = performanceMode ? 20 : 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 1;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const color = new THREE.Color(snippet.color);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
      
      particleSizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData.isCodeParticles = true;
    windowGroup.add(particles);
    
    windowGroup.userData = { snippet, index, type: 'code' };
    return windowGroup;
  };

  const createTerminalWindow = useMemo(() => (terminal: any, index: number) => {
    const terminalGroup = new THREE.Group();
    
    const frameWidth = 4.5;
    const frameHeight = 2.5;
    
    // Terminal background
    const bgGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.95,
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    terminalGroup.add(background);
    
    // Terminal border
    const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(frameWidth, frameHeight));
    const borderMaterial = new THREE.LineBasicMaterial({
      color: terminal.color,
      transparent: true,
      opacity: 0.8,
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    terminalGroup.add(border);
    
    // Terminal content
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 900;
      canvas.height = 500;
      
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Terminal title
      context.fillStyle = terminal.color;
      context.font = 'bold 20px monospace';
      context.fillText(terminal.title, 20, 30);
      
      // Commands
      context.font = '16px monospace';
      terminal.commands.forEach((command: string, cmdIndex: number) => {
        const y = 60 + cmdIndex * 25;
        
        if (command.startsWith('$')) {
          context.fillStyle = '#00ff00';
          context.fillText('➜ ', 20, y);
          context.fillStyle = '#ffffff';
          context.fillText(command.substring(2), 50, y);
        } else {
          context.fillStyle = '#cccccc';
          context.fillText(command, 20, y);
        }
      });
      
      // Blinking cursor
      context.fillStyle = '#00ff00';
      context.fillRect(20, 60 + terminal.commands.length * 25, 10, 20);
      
      const texture = new THREE.CanvasTexture(canvas);
      const terminalMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      
      const terminalGeometry = new THREE.PlaneGeometry(frameWidth - 0.1, frameHeight - 0.1);
      const terminalMesh = new THREE.Mesh(terminalGeometry, terminalMaterial);
      terminalMesh.position.z = 0.01;
      
      terminalGroup.add(terminalMesh);
    }
    
    terminalGroup.userData = { terminal, index, type: 'terminal' };
    return terminalGroup;
  }, []);

  const getCodeColor = (line: string): string => {
    if (line.includes('const ') || line.includes('let ') || line.includes('var ')) return '#ff6b6b';
    if (line.includes('function') || line.includes('def ') || line.includes('class ')) return '#4ecdc4';
    if (line.includes('return') || line.includes('import') || line.includes('from')) return '#45b7d1';
    if (line.includes('//') || line.includes('#')) return '#95a5a6';
    if (line.includes('"') || line.includes("'")) return '#f39c12';
    return '#ffffff';
  };

  useEffect(() => {
    if (!scene) return;

    const mainGroup = new THREE.Group();
    codeGroupRef.current = mainGroup;

    // Create code windows
    codeSnippets.forEach((snippet, index) => {
      const codeWindow = createCodeWindow(snippet, index);
      
      // Position in 3D space
      const angle = (index / codeSnippets.length) * Math.PI * 2;
      const radius = 8;
      codeWindow.position.set(
        Math.cos(angle) * radius,
        Math.sin(index * 1.2) * 3,
        Math.sin(angle) * radius
      );
      
      codeWindow.rotation.y = -angle + Math.PI / 2;
      codeWindow.userData.originalPosition = codeWindow.position.clone();
      codeWindow.userData.originalRotation = codeWindow.rotation.clone();
      codeWindow.userData.angle = angle;
      
      mainGroup.add(codeWindow);
    });

    // Create terminal windows
    terminalCommands.forEach((terminal, index) => {
      const terminalWindow = createTerminalWindow(terminal, index);
      
      // Position terminals in a different layer
      const angle = (index / terminalCommands.length) * Math.PI * 2;
      const radius = 6;
      terminalWindow.position.set(
        Math.cos(angle + Math.PI) * radius,
        Math.sin(index * 0.8) * 2 - 1,
        Math.sin(angle + Math.PI) * radius
      );
      
      terminalWindow.rotation.y = -angle - Math.PI / 2;
      terminalWindow.userData.originalPosition = terminalWindow.position.clone();
      terminalWindow.userData.originalRotation = terminalWindow.rotation.clone();
      terminalWindow.userData.angle = angle;
      
      mainGroup.add(terminalWindow);
    });

    scene.add(mainGroup);

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      mainGroup.children.forEach((window) => {
        if (window instanceof THREE.Group) {
          const userData = window.userData;
          const originalPos = userData.originalPosition;
          const originalRot = userData.originalRotation;
          
          // Floating animation
          window.position.y = originalPos.y + Math.sin(elapsedTime * 0.5 + userData.index) * 0.3;
          
          // Gentle rotation
          window.rotation.x = originalRot.x + Math.sin(elapsedTime * 0.3 + userData.index) * 0.1;
          
          // Orbital drift
          if (userData.type === 'code') {
            const newAngle = userData.angle + elapsedTime * 0.02;
            const radius = 8 + Math.sin(elapsedTime * 0.1 + userData.index) * 0.5;
            window.position.x = Math.cos(newAngle) * radius;
            window.position.z = Math.sin(newAngle) * radius;
            window.rotation.y = -newAngle + Math.PI / 2;
          } else if (userData.type === 'terminal') {
            const newAngle = userData.angle + elapsedTime * 0.015;
            const radius = 6 + Math.sin(elapsedTime * 0.08 + userData.index) * 0.3;
            window.position.x = Math.cos(newAngle + Math.PI) * radius;
            window.position.z = Math.sin(newAngle + Math.PI) * radius;
            window.rotation.y = -newAngle - Math.PI / 2;
          }
          
          // Update shader uniforms and animate particles
          window.traverse((child) => {
            if (child instanceof THREE.LineSegments && child.material instanceof THREE.ShaderMaterial) {
              if (child.material.uniforms && child.material.uniforms.uTime) {
                child.material.uniforms.uTime.value = elapsedTime;
              }
            }
            
            if (child instanceof THREE.Points && child.userData.isCodeParticles) {
              child.rotation.y = elapsedTime * 0.2;
              child.rotation.z = Math.sin(elapsedTime * 0.3) * 0.1;
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
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
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
      
      codeGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, performanceMode, codeSnippets, terminalCommands]);

  return null;
}
