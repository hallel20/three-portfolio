'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Plane } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { usePortfolioStore } from '@/lib/store';
import { Project } from '@/lib/types';

export function ProjectCards() {
  const { projects, setSelectedProject, filter } = usePortfolioStore();

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.category === filter
  );

  return (
    <group>
      {filteredProjects.map((project, index) => (
        <ProjectCard3D 
          key={project.id} 
          project={project} 
          index={index}
          onClick={() => setSelectedProject(project)}
        />
      ))}
    </group>
  );
}

interface ProjectCard3DProps {
  project: Project;
  index: number;
  onClick: () => void;
}

function ProjectCard3D({ project, index, onClick }: ProjectCard3DProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation for floating effect
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = project.position.y + Math.sin(state.clock.elapsedTime + index) * 0.2;
      ref.current.rotation.y += 0.005;
    }
  });

  // Spring animation for hover effects
  const { scale, opacity } = useSpring({
    scale: hovered ? 1.1 : 1,
    opacity: hovered ? 1 : 0.9,
    config: { tension: 200, friction: 25 }
  });

  const cardGeometry = getGeometryByCategory(project.category);

  return (
    <a.group 
      ref={ref}
      position={[project.position.x, project.position.y, project.position.z]}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card Background */}
      <a.mesh castShadow receiveShadow={true}>
        {cardGeometry}
        {/* @ts-ignore */}
        <a.meshStandardMaterial
          color={project.color}
          transparent
          opacity={opacity}
          roughness={0.2}
          metalness={0.8}
        />
      </a.mesh>

      {/* Project Title */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {project.title}
      </Text>

      {/* Project Description */}
      {hovered && (
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center" 
          anchorY="middle"
          maxWidth={4}
        >
          {project.description}
        </Text>
      )}

      {/* Technologies */}
      {hovered && (
        <group position={[0, -2.5, 0]}>
          {project.technologies.slice(0, 3).map((tech, i) => (
            <Text
              key={tech}
              position={[(i - 1) * 1.2, 0, 0]}
              fontSize={0.1}
              color="#888888"
              anchorX="center"
              anchorY="middle"
            >
              {tech}
            </Text>
          ))}
        </group>
      )}
    </a.group>
  );
}

function getGeometryByCategory(category: Project['category']) {
  switch (category) {
    case 'web-development':
      return <boxGeometry args={[2, 2.5, 0.2]} />;
    case 'mobile-app':
      return <sphereGeometry args={[1.2, 32, 32]} />;
    case 'backend-api':
      return <coneGeometry args={[1, 2.5, 8]} />;
    case 'open-source':
      return <cylinderGeometry args={[1, 1, 2.5, 8]} />;
    default:
      return <boxGeometry args={[2, 2.5, 0.2]} />;
  }
}