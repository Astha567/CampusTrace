import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Layers, Box } from 'lucide-react';
import { Building } from '../types';

interface ThreeDBuildingModalProps {
  building: Building;
  onClose: () => void;
  onSelectFloor: (level: number) => void;
}

export const ThreeDBuildingModal: React.FC<ThreeDBuildingModalProps> = ({
  building,
  onClose,
  onSelectFloor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1217); // Warm dark plum

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 18, 26);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff4de, 1.1); // Warm cream ambient
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffced8, 2.0); // Soft rose directional
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const softLight = new THREE.DirectionalLight(0xffe8c4, 1.4); // Peach accent
    softLight.position.set(-20, 15, -15);
    scene.add(softLight);

    // Ground platform
    const groundGeo = new THREE.CylinderGeometry(18, 18, 0.8, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2d1f27,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.4;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const grid = new THREE.GridHelper(26, 26, 0x5c3d4e, 0x3d2734);
    grid.position.y = 0.05;
    scene.add(grid);

    // Create 3 floors as extruded boxes using the new palette:
    // Ground: #D94A6E (vibrant coral rose), 1st: #FFCED8 (pastel rose), 2nd: #FFE8C4 (warm peach)
    const floorMeshes: THREE.Group[] = [];
    const floorColors = [0xd94a6e, 0xffced8, 0xffe8c4];

    for (let i = 0; i < 3; i++) {
      const floorGroup = new THREE.Group();

      // Main slab
      const slabGeo = new THREE.BoxGeometry(12, 2.2, 10);
      const slabMat = new THREE.MeshStandardMaterial({
        color: floorColors[i],
        roughness: 0.35,
        metalness: 0.15,
        transparent: true,
        opacity: 0.94,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // Glass windows strip
      const windowGeo = new THREE.BoxGeometry(12.1, 0.9, 10.1);
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xfff4de,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.55,
      });
      const windowMesh = new THREE.Mesh(windowGeo, windowMat);
      floorGroup.add(windowMesh);

      // Edge wireframe accent
      const edges = new THREE.EdgesGeometry(slabGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
      );
      floorGroup.add(line);

      // Position floor
      floorGroup.position.y = i * 2.8 + 1.2;
      scene.add(floorGroup);
      floorMeshes.push(floorGroup);
    }

    // Roof solar panels / terrace
    const roofGroup = new THREE.Group();
    const roofGeo = new THREE.BoxGeometry(11, 0.4, 9);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a333f, roughness: 0.5 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofGroup.add(roofMesh);

    // Solar panels on roof
    for (let x = -3.5; x <= 3.5; x += 2.5) {
      for (let z = -2.5; z <= 2.5; z += 2.5) {
        const solarGeo = new THREE.BoxGeometry(1.8, 0.2, 1.8);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x8c203b, metalness: 0.8 });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.position.set(x, 0.3, z);
        roofGroup.add(solar);
      }
    }
    roofGroup.position.y = 3 * 2.8 + 1.2;
    scene.add(roofGroup);

    // Mouse / Touch Drag Orbiting
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      scene.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(4, Math.min(30, camera.position.y + deltaY * 0.05));
      camera.lookAt(0, 4, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        scene.rotation.y += 0.003;
      }

      // Smooth exploded axonometric view interpolation
      floorMeshes.forEach((mesh, idx) => {
        const targetY = exploded ? idx * 4.6 + 1.5 : idx * 2.8 + 1.2;
        mesh.position.y += (targetY - mesh.position.y) * 0.1;
      });
      const targetRoofY = exploded ? 3 * 4.6 + 1.5 : 3 * 2.8 + 1.2;
      roofGroup.position.y += (targetRoofY - roofGroup.position.y) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [exploded]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="threed-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D1F25]/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#20181D] text-[#FFFDF9] rounded-3xl max-w-4xl w-full h-[85vh] border border-[#FFCED8]/30 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#38202A] flex items-center justify-between bg-[#20181D]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCED8]/20 text-[#FFCED8] flex items-center justify-center border border-[#FFCED8]/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="threed-modal-title" className="font-bold text-base sm:text-lg text-[#FFF4DE]">
                  {building.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#FFE8C4]/20 text-[#FFE8C4] border border-[#FFE8C4]/30">
                  3D View (Experimental)
                </span>
              </div>
              <p className="text-xs text-[#BFA5AF]">
                Extruded floor stack model with CampusTrace palette. Drag to rotate.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#BFA5AF] hover:text-white rounded-xl bg-[#2D2229] hover:bg-[#3D2C37] transition"
            aria-label="Close 3D View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Canvas Container */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing w-full h-full overflow-hidden">
          <div ref={containerRef} className="w-full h-full" />

          {/* Floating HUD Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => setExploded((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-lg backdrop-blur-md ${
                exploded
                  ? 'bg-[#D94A6E] border-[#FFCED8] text-white shadow-[#D94A6E]/30'
                  : 'bg-[#261E23]/90 border-[#422C36] text-[#FFCED8] hover:bg-[#34262E]'
              }`}
            >
              <Layers className="w-4 h-4" />
              {exploded ? 'Collapse Floors' : 'Explode Floor Stack'}
            </button>
          </div>

          {/* Floor selection chips */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-center gap-2 p-3 bg-[#1A1217]/80 backdrop-blur-md rounded-2xl border border-[#38202A]">
            <span className="text-xs text-[#BFA5AF] font-semibold mr-1">Switch to 2D Plan:</span>
            {building.floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => {
                  onSelectFloor(floor.level);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2A1F26] hover:bg-[#D94A6E] text-[#FFF4DE] hover:text-white transition border border-[#422C36] flex items-center gap-1.5"
              >
                <span>{floor.name}</span>
                <span className="text-[10px] text-[#FFCED8]">({floor.rooms.length} rooms)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-5 py-2.5 bg-[#171014] border-t border-[#38202A] text-[11px] text-[#A88E98] flex items-center justify-between">
          <span>* Experimental CAD prototype in CampusTrace. Full interior LiDAR model in roadmap.</span>
          <span className="hidden sm:inline">Left-click + Drag to orbit</span>
        </div>
      </div>
    </div>
  );
};
