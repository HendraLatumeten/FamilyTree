'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera, PresentationControls, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

const Connection = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
  return (
    <Line
      points={[start, end]}
      color="#0ea5e9"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
};

const Node = ({ position, size = 0.2, color = "#38bdf8" }: { position: [number, number, number], size?: number, color?: string }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      <pointLight distance={2} intensity={0.5} color={color} />
    </mesh>
  );
};

const FamilyTreeVisual = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generating a procedural "Family Tree" node structure
  const nodes = useMemo(() => {
    const tempNodes: { id: number, pos: [number, number, number], level: number }[] = [
      { id: 0, pos: [0, -2, 0], level: 0 }, // Root
      { id: 1, pos: [-1.5, 0, 0], level: 1 },
      { id: 2, pos: [1.5, 0, 0], level: 1 },
      { id: 3, pos: [-2.5, 2, -1], level: 2 },
      { id: 4, pos: [-0.5, 2, 1], level: 2 },
      { id: 5, pos: [0.5, 2, -1], level: 2 },
      { id: 6, pos: [2.5, 2, 1], level: 2 },
    ];
    return tempNodes;
  }, []);

  const connections = useMemo(() => {
    return [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]
    ];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <Node key={node.id} position={node.pos} size={node.level === 0 ? 0.25 : 0.15} />
      ))}
      {connections.map(([startIdx, endIdx], i) => (
        <Connection key={i} start={nodes[startIdx].pos} end={nodes[endIdx].pos} />
      ))}
    </group>
  );
};

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <PresentationControls
          global
          snap
          speed={1.5}
          zoom={0.8}
          polar={[-0.1, 0.2]}
          azimuth={[-Infinity, Infinity]}
        >
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <FamilyTreeVisual />
          </Float>
        </PresentationControls>

        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshDistortMaterial
            transparent
            opacity={0.05}
            color="#0ea5e9"
            distort={0.4}
            speed={2}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
