"use client";

import { usePortfolioStore } from "@/lib/store";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";

interface ProjectCardsProps {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  canvas: HTMLCanvasElement | null;
  performanceMode?: boolean;
  onProjectHover?: (project: any) => void;
  onProjectSelect?: (project: any) => void;
}

export function ProjectCards({
  scene,
  camera,
  canvas,
  performanceMode = false,
  onProjectHover,
  onProjectSelect,
}: ProjectCardsProps) {
  const cardsRef = useRef<THREE.Group[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const [hoveredCard, setHoveredCard] = useState<THREE.Group | null>(null);

  const { projects, setSelectedProject, filter } = usePortfolioStore();

  // Memoize filtered projects to prevent recreation
  const filteredProjects = useMemo(() => {
    return projects
      .map((project, index) => ({
        ...project,
        position: project.position || { x: 0, y: 0, z: -2 + index * -3 },
      }))
      .filter((project) => filter === "all" || project.category === filter);
  }, [projects, filter]);

  // Create geometry based on category
  const createGeometryByCategory = useCallback(
    (category: string) => {
      switch (category) {
        case "web-development":
          return new THREE.BoxGeometry(2, 2.5, 0.2);
        case "mobile-app":
          return new THREE.SphereGeometry(
            1.2,
            performanceMode ? 16 : 32,
            performanceMode ? 16 : 32
          );
        case "backend-api":
          return new THREE.ConeGeometry(1, 2.5, performanceMode ? 6 : 8);
        case "open-source":
          return new THREE.CylinderGeometry(1, 1, 2.5, performanceMode ? 6 : 8);
        default:
          return new THREE.BoxGeometry(2, 2.5, 0.2);
      }
    },
    [performanceMode]
  );

  useEffect(() => {
    if (!scene || !camera || !canvas) return;

    // Clear existing cards
    cardsRef.current.forEach((card) => {
      scene.remove(card);
      // Dispose of geometries and materials
      card.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    cardsRef.current = [];

    // Create project cards
    const newCards = filteredProjects.map((project, index) => {
      const cardGroup = new THREE.Group();

      // Get geometry based on category
      const geometry = createGeometryByCategory(project.category);

      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(project.color),
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);

      if (!performanceMode) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }

      cardGroup.add(mesh);
      cardGroup.position.set(
        project.position.x,
        project.position.y,
        project.position.z
      );

      // Store project data for interaction
      cardGroup.userData = {
        project,
        index,
        originalScale: 1,
        originalPosition: { ...project.position },
      };

      scene.add(cardGroup);
      return cardGroup;
    });

    cardsRef.current = newCards;

    // Mouse interaction setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardsRef.current, true);

      if (intersects.length > 0) {
        const intersectedGroup = intersects[0].object.parent as THREE.Group;
        if (intersectedGroup !== hoveredCard) {
          setHoveredCard(intersectedGroup);
          canvas.style.cursor = "pointer";

          // Call external hover callback
          if (onProjectHover) {
            onProjectHover(intersectedGroup.userData.project);
          }
        }
      } else {
        if (hoveredCard) {
          setHoveredCard(null);
          canvas.style.cursor = "default";

          if (onProjectHover) {
            onProjectHover(null);
          }
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardsRef.current, true);

      if (intersects.length > 0) {
        const intersectedGroup = intersects[0].object.parent as THREE.Group;
        const project = intersectedGroup?.userData.project;

        setSelectedProject(project);

        if (onProjectSelect) {
          onProjectSelect(project);
        }
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    // Animation loop
    let animationId: number;

    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      cardsRef.current.forEach((cardGroup, index) => {
        if (cardGroup && cardGroup.userData) {
          const originalPos = cardGroup.userData.originalPosition;

          // Floating animation
          cardGroup.position.y =
            originalPos.y + Math.sin(elapsedTime + index) * 0.2;

          // Rotation animation
          cardGroup.rotation.y += 0.005;

          // Hover effects
          const isHovered = cardGroup === hoveredCard;
          const targetScale = isHovered ? 1.1 : 1;

          // Smooth scale interpolation
          cardGroup.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.1
          );

          // Opacity effect
          const targetOpacity = isHovered ? 1 : 0.9;
          const mesh = cardGroup.children[0] as THREE.Mesh;
          if (mesh && mesh.material && "opacity" in mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.opacity += (targetOpacity - material.opacity) * 0.1;

            // Add emissive glow on hover
            if (isHovered && !performanceMode) {
              const emissiveIntensity = 0.1 + Math.sin(elapsedTime * 4) * 0.05;
              material.emissive = new THREE.Color(
                cardGroup.userData.project.color
              );
              material.emissiveIntensity = emissiveIntensity;
            } else {
              material.emissiveIntensity = 0;
            }
          }

          // Additional hover animations
          if (isHovered) {
            // Subtle bobbing motion
            cardGroup.position.y += Math.sin(elapsedTime * 8) * 0.02;

            // Slight forward movement
            cardGroup.position.z =
              originalPos.z + Math.sin(elapsedTime * 2) * 0.1;
          } else {
            cardGroup.position.z = originalPos.z;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);

      // Clean up cards
      cardsRef.current.forEach((card) => {
        scene.remove(card);
        card.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
      cardsRef.current = [];
    };
  }, [
    scene,
    camera,
    canvas,
    filteredProjects,
    hoveredCard,
    performanceMode,
    onProjectHover,
    onProjectSelect,
    setSelectedProject,
    createGeometryByCategory,
  ]);

  return null;
}

// Standalone version for testing
export function StandaloneProjectCards() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [hoveredProject, setHoveredProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [performanceMode, setPerformanceMode] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1.5, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !performanceMode,
      alpha: true,
    });
    renderer.setSize(600, 400);

    if (!performanceMode) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    if (!performanceMode) {
      directionalLight.castShadow = true;
    }
    scene.add(directionalLight);

    sceneRef.current = scene;
    cameraRef.current = camera;

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
          onClick={() => setPerformanceMode(!performanceMode)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Performance Mode: {performanceMode ? "ON" : "OFF"}
        </button>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} className="border rounded" />

        {/* Project info overlay */}
        {hoveredProject && (
          <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs">
            <h3 className="text-lg font-bold mb-2">{hoveredProject.title}</h3>
            <p className="text-sm text-gray-300 mb-2">
              {hoveredProject.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {hoveredProject.technologies.slice(0, 3).map((tech: string) => (
                <span
                  key={tech}
                  className="text-xs bg-gray-700 px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p className="font-bold">Selected: {selectedProject.title}</p>
        </div>
      )}

      <ProjectCards
        scene={sceneRef.current}
        camera={cameraRef.current}
        canvas={canvasRef.current}
        performanceMode={performanceMode}
        onProjectHover={setHoveredProject}
        onProjectSelect={setSelectedProject}
      />

      <div className="text-sm text-gray-600 text-center">
        Hover over 3D cards to see details • Click to select
      </div>
    </div>
  );
}
