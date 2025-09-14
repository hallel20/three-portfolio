"use client";
import { useUIStore } from "@/lib/store";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { LoadingFallback } from "./LoadingFallback";
import { FloatingText } from "./FloatingText";
import { ProjectCards } from "./ProjectCards";
import { AdvancedParticleSystem, CodeParticleSystem } from "./AdvancedParticleSystem";
import { HolographicProjectDisplay } from "./HolographicProjectDisplay";
import { SkillVisualization } from "./SkillVisualization";
import { FloatingCodeElements } from "./FloatingCodeElements";

interface SceneProps {
  className?: string;
}

export default function Scene({ className = "" }: SceneProps) {
  const canvasRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const frameIdRef = useRef<any>(null);
  const clockRef = useRef<any>(new THREE.Clock());

  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { performanceMode } = useUIStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !performanceMode,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, performanceMode ? 1 : 2)
    );

    if (!performanceMode) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    if (!performanceMode) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
    }
    scene.add(directionalLight);

    // Multiple colored point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x3b82f6, 0.8, 30);
    pointLight1.position.set(-10, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 0.6, 25);
    pointLight2.position.set(10, -5, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf59e0b, 0.4, 20);
    pointLight3.position.set(0, 10, 0);
    scene.add(pointLight3);

    // Environment setup (simple background)
    const envGeometry = new THREE.SphereGeometry(100, 32, 32);
    const envMaterial = new THREE.MeshBasicMaterial({
      color: 0x001122,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.3,
    });
    const envMesh = new THREE.Mesh(envGeometry, envMaterial);
    scene.add(envMesh);

    // Controls setup (simplified orbit controls)
    const controls = {
      enabled: true,
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
      minDistance: 3,
      maxDistance: 20,
      minPolarAngle: Math.PI / 6,
      maxPolarAngle: Math.PI - Math.PI / 6,
      autoRotate: false,
      autoRotateSpeed: 0.5,
      target: new THREE.Vector3(0, 0, 0),
      distance: 10,
      azimuthAngle: 0,
      polarAngle: Math.PI / 2,
      isDragging: false,
      previousMouse: { x: 0, y: 0 },
    };

    controlsRef.current = controls;

    // Mouse controls
    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
      controls.isDragging = true;
      controls.previousMouse = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
      setMousePosition({ x: event.clientX, y: event.clientY });

      if (controls.isDragging && controls.enableRotate) {
        const deltaX = event.clientX - controls.previousMouse.x;
        const deltaY = event.clientY - controls.previousMouse.y;

        controls.azimuthAngle -= deltaX * 0.01;
        controls.polarAngle = Math.max(
          controls.minPolarAngle,
          Math.min(controls.maxPolarAngle, controls.polarAngle + deltaY * 0.01)
        );

        controls.previousMouse = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      controls.isDragging = false;
    };

    const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
      if (controls.enableZoom) {
        controls.distance = Math.max(
          controls.minDistance,
          Math.min(
            controls.maxDistance,
            controls.distance + event.deltaY * 0.01
          )
        );
      }
    };

    canvasRef.current.addEventListener("mousedown", onMouseDown);
    canvasRef.current.addEventListener("mousemove", onMouseMove);
    canvasRef.current.addEventListener("mouseup", onMouseUp);
    canvasRef.current.addEventListener("wheel", onWheel);

    // Animation loop
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      // Update camera position based on controls
      if (controls) {
        const x =
          controls.target.x +
          controls.distance *
            Math.sin(controls.polarAngle) *
            Math.sin(controls.azimuthAngle);
        const y =
          controls.target.y + controls.distance * Math.cos(controls.polarAngle);
        const z =
          controls.target.z +
          controls.distance *
            Math.sin(controls.polarAngle) *
            Math.cos(controls.azimuthAngle);

        camera.position.set(x, y, z);
        camera.lookAt(controls.target);

        if (controls.autoRotate) {
          controls.azimuthAngle += controls.autoRotateSpeed * 0.01;
        }
      }

      // Animate scene objects
      scene.traverse((object) => {
        if (object.userData.isProjectCard) {
          object.position.y +=
            Math.sin(elapsedTime + object.position.x) * 0.002;
          object.rotation.y += 0.005;
        }

        if (object.userData.isFloatingText) {
          object.position.y = 4 + Math.sin(elapsedTime * 0.5) * 0.5;
          object.rotation.z = Math.sin(elapsedTime * 0.3) * 0.1;
        }

        if (object.userData.isParticleBackground) {
          object.rotation.y += 0.001;
        }
      });

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation and mark as loaded
    animate();
    setTimeout(() => setIsLoading(false), 1000);

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && renderer && camera) {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, performanceMode ? 1 : 2)
        );
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      window.removeEventListener("resize", handleResize);

      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousedown", onMouseDown);
        canvasRef.current.removeEventListener("mousemove", onMouseMove);
        canvasRef.current.removeEventListener("mouseup", onMouseUp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        canvasRef.current.removeEventListener("wheel", onWheel);
      }

      // Dispose of Three.js objects
      scene.traverse((object: any) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
      }
    };
  }, [performanceMode]);

  return (
    <div className={`w-screen h-screen relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #001122 0%, #000510 50%, #000000 100%)",
          cursor: controlsRef.current?.isDragging ? "grabbing" : "grab",
        }}
      />
      {isLoading && <LoadingFallback />}

      {/* Enhanced Component integrations */}
      <FloatingText
        scene={sceneRef.current}
        performanceMode={performanceMode}
      />
      
      {/* Advanced particle systems replace the basic one */}
      <AdvancedParticleSystem
        scene={sceneRef.current}
        performanceMode={performanceMode}
      />
      <CodeParticleSystem
        scene={sceneRef.current}
        performanceMode={performanceMode}
      />
      
      {/* Enhanced project displays */}
      <HolographicProjectDisplay
        scene={sceneRef.current}
        camera={cameraRef.current}
        canvas={canvasRef.current}
        performanceMode={performanceMode}
      />
      <ProjectCards
        scene={sceneRef.current}
        camera={cameraRef.current}
        performanceMode={performanceMode}
        canvas={canvasRef.current}
      />
      
      {/* Skill and code visualizations */}
      <SkillVisualization
        scene={sceneRef.current}
        performanceMode={performanceMode}
      />
      <FloatingCodeElements
        scene={sceneRef.current}
        performanceMode={performanceMode}
      />

      {/* Performance stats overlay (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded text-xs font-mono">
          <div>FPS: {Math.round(1000 / clockRef.current?.getDelta() || 0)}</div>
          <div>Performance Mode: {performanceMode ? "ON" : "OFF"}</div>
          <div>
            Mouse: {mousePosition.x}, {mousePosition.y}
          </div>
        </div>
      )}

      {/* Controls info */}
      <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded text-sm">
        <div className="mb-1">🖱️ Click + Drag: Rotate</div>
        <div className="mb-1">🔍 Scroll: Zoom</div>
        <div>
          ⚡ Performance Mode: {performanceMode ? "Enabled" : "Disabled"}
        </div>
      </div>
    </div>
  );
}
