"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FloatingTextProps {
  scene: THREE.Scene | null;
  performanceMode?: boolean;
}

export function FloatingText({
  scene,
  performanceMode = false,
}: FloatingTextProps) {
  const elementsRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!scene) return;

    // Create main group for all floating text elements
    const group = new THREE.Group();
    elementsRef.current = group;

    // Helper function to create text texture
    const createTextTexture = (
      text: string,
      fontSize: number = 64,
      color: string = "#ffffff",
      fontWeight: string = "normal"
    ) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return null;

      // Calculate canvas size based on text
      const tempContext = context;
      tempContext.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      const metrics = tempContext.measureText(text);

      canvas.width = Math.ceil(metrics.width) + 40;
      canvas.height = fontSize + 20;

      // Clear and set up context
      context.fillStyle = "rgba(0, 0, 0, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      context.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      context.fillStyle = color;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      return new THREE.CanvasTexture(canvas);
    };

    // Create title text
    const titleTexture = createTextTexture(
      "Hallel Ojowuro",
      80,
      "#ffffff",
      "bold"
    );
    if (titleTexture) {
      const titleMaterial = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
        alphaTest: 0.1,
      });

      const titleGeometry = new THREE.PlaneGeometry(8, 1);
      const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
      titleMesh.position.set(0, 3, -2);
      titleMesh.userData.isTitle = true;
      titleMesh.userData.originalY = 3;
      group.add(titleMesh);
    }

    // Create subtitle text
    const subtitleTexture = createTextTexture(
      "Software Engineer | Open Source Contributor",
      40,
      "#cccccc",
      "normal"
    );
    if (subtitleTexture) {
      const subtitleMaterial = new THREE.MeshBasicMaterial({
        map: subtitleTexture,
        transparent: true,
        alphaTest: 0.1,
      });

      const subtitleGeometry = new THREE.PlaneGeometry(10, 0.6);
      const subtitleMesh = new THREE.Mesh(subtitleGeometry, subtitleMaterial);
      subtitleMesh.position.set(0, 2, -2);
      subtitleMesh.userData.isSubtitle = true;
      subtitleMesh.userData.originalY = 2;
      group.add(subtitleMesh);
    }

    // Create decorative spheres
    const leftSphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const leftSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#3B82F6",
      emissive: "#3B82F6",
      emissiveIntensity: performanceMode ? 0.1 : 0.2,
    });
    const leftSphere = new THREE.Mesh(leftSphereGeometry, leftSphereMaterial);
    leftSphere.position.set(-4, 2.5, -3);
    leftSphere.userData.isDecorativeElement = true;
    leftSphere.userData.originalPosition = { x: -4, y: 2.5, z: -3 };
    leftSphere.userData.phase = 0;
    group.add(leftSphere);

    const rightSphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const rightSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#10B981",
      emissive: "#10B981",
      emissiveIntensity: performanceMode ? 0.1 : 0.2,
    });
    const rightSphere = new THREE.Mesh(
      rightSphereGeometry,
      rightSphereMaterial
    );
    rightSphere.position.set(4, 2.5, -3);
    rightSphere.userData.isDecorativeElement = true;
    rightSphere.userData.originalPosition = { x: 4, y: 2.5, z: -3 };
    rightSphere.userData.phase = Math.PI;
    group.add(rightSphere);

    // Create ring element
    const ringGeometry = new THREE.RingGeometry(0.15, 0.18, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: "#F59E0B",
      emissive: "#F59E0B",
      emissiveIntensity: performanceMode ? 0.05 : 0.1,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0, 1.2, -2.5);
    ring.userData.isRing = true;
    ring.userData.originalY = 1.2;
    group.add(ring);

    // Add group to scene
    scene.add(group);

    // Animation loop
    let animationId: number;

    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      // Animate all elements in the group
      group.children.forEach((child) => {
        if (child.userData.isTitle) {
          child.position.y =
            child.userData.originalY + Math.sin(elapsedTime) * 0.1;
          // Subtle rotation for title
          child.rotation.z = Math.sin(elapsedTime * 0.5) * 0.02;
        }

        if (child.userData.isSubtitle) {
          child.position.y =
            child.userData.originalY + Math.sin(elapsedTime + 0.5) * 0.08;
        }

        if (child.userData.isDecorativeElement) {
          const originalPos = child.userData.originalPosition;
          child.position.y =
            originalPos.y +
            Math.sin(elapsedTime * 1.5 + child.userData.phase) * 0.15;
          child.rotation.y += 0.02;
          child.rotation.x += 0.01;

          // Pulsing emissive intensity
          // @ts-ignore
          if (child.material && child.material.emissive && !performanceMode) {
            const intensity =
              0.2 + Math.sin(elapsedTime * 2 + child.userData.phase) * 0.1;
            // @ts-ignore
            child.material.emissiveIntensity = intensity;
          }
        }

        if (child.userData.isRing) {
          child.position.y =
            child.userData.originalY + Math.sin(elapsedTime * 0.8) * 0.05;
          child.rotation.z += 0.01;

          // Scale pulsing
          const scale = 1 + Math.sin(elapsedTime * 3) * 0.1;
          child.scale.set(scale, scale, scale);
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

      if (scene && group) {
        scene.remove(group);

        // Dispose of all geometries and materials
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
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

      elementsRef.current = null;
    };
  }, [scene, performanceMode]);

  // This component doesn't render anything directly to React DOM
  // All rendering is handled by Three.js
  return null;
}

// Optional: Export a standalone version that creates its own scene (for testing)
export function StandaloneFloatingText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });

    renderer.setSize(400, 300);
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

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
      <canvas ref={canvasRef} className="border rounded" />
      <FloatingText scene={sceneRef.current} />
    </div>
  );
}
