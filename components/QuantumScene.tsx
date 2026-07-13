/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cylinder, Stars, Box } from '@react-three/drei';
import * as THREE from 'three';

const QuantumParticle = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.2;
      ref.current.rotation.x = t * 0.5;
      ref.current.rotation.z = t * 0.3;
    }
  });

  return (
    <Sphere ref={ref} args={[1, isMobile ? 12 : 24, isMobile ? 12 : 24]} position={position} scale={scale}>
      {isMobile ? (
        <meshPhongMaterial
          color={color}
          shininess={80}
          specular={color}
        />
      ) : (
        <MeshDistortMaterial
          color={color}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.5}
          distort={0.4}
          speed={2}
        />
      )}
    </Sphere>
  );
};

const MacroscopicWave = () => {
  const ref = useRef<THREE.Mesh>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.x = Math.sin(t * 0.2) * 0.2;
       ref.current.rotation.y = t * 0.1;
    }
  });

  return (
    <Torus ref={ref} args={[3, 0.1, isMobile ? 8 : 16, isMobile ? 32 : 64]} rotation={[Math.PI / 2, 0, 0]}>
      <meshPhongMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={0.5} transparent opacity={0.6} wireframe />
    </Torus>
  );
}

export const HeroScene: React.FC = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={isMobile ? 0.85 : [1, 1.25]}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <QuantumParticle position={[0, 0, 0]} color="#4F46E5" scale={1.2} />
          <MacroscopicWave />
        </Float>
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <QuantumParticle position={[-3, 1, -2]} color="#9333EA" scale={0.5} />
           <QuantumParticle position={[3, -1, -3]} color="#C5A059" scale={0.6} />
        </Float>

        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#818CF8" />
        {!isMobile && <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#F59E0B" />}
        <Stars radius={100} depth={50} count={isMobile ? 300 : 800} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  );
};

export const QuantumComputerScene: React.FC = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={isMobile ? 0.85 : [1, 1.25]}
        gl={{ 
          antialias: !isMobile, 
          alpha: true, 
          powerPreference: "high-performance" 
        }}
      >
        <ambientLight intensity={1} />
        {!isMobile && (
          <>
            <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
            <pointLight position={[-5, -5, -5]} intensity={0.5} />
          </>
        )}
        <directionalLight position={[0, 10, 0]} intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[5, -5, 5]} intensity={0.8} color="#F59E0B" />
        
        <Float rotationIntensity={isMobile ? 0.2 : 0.4} floatIntensity={isMobile ? 0.1 : 0.2} speed={1}>
          <group rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
            {/* Main Cryostat Structure (Gold Chandelier) */}
            
            {/* Top Plate */}
            <Cylinder args={[1.2, 1.2, 0.1, isMobile ? 16 : 32]} position={[0, 1, 0]}>
              <meshPhongMaterial color="#C5A059" shininess={100} specular="#FFD700" />
            </Cylinder>
            
            {/* Middle Stage */}
            <Cylinder args={[1, 1, 0.1, isMobile ? 16 : 32]} position={[0, 0.2, 0]}>
              <meshPhongMaterial color="#C5A059" shininess={100} specular="#FFD700" />
            </Cylinder>
            
            {/* Bottom Stage (Mixing Chamber) */}
            <Cylinder args={[0.6, 0.6, 0.1, isMobile ? 16 : 32]} position={[0, -0.6, 0]}>
              <meshPhongMaterial color="#C5A059" shininess={100} specular="#FFD700" />
            </Cylinder>

            {/* Connecting Rods */}
            <Cylinder args={[0.04, 0.04, 0.8, isMobile ? 6 : 10]} position={[0.5, 0.6, 0]}>
               <meshLambertMaterial color="#D1D5DB" />
            </Cylinder>
            <Cylinder args={[0.04, 0.04, 0.8, isMobile ? 6 : 10]} position={[-0.5, 0.6, 0]}>
               <meshLambertMaterial color="#D1D5DB" />
            </Cylinder>
            {!isMobile && (
              <>
                <Cylinder args={[0.04, 0.04, 0.8, 10]} position={[0, 0.6, 0.5]}>
                   <meshLambertMaterial color="#D1D5DB" />
                </Cylinder>
                <Cylinder args={[0.04, 0.04, 0.8, 10]} position={[0, 0.6, -0.5]}>
                   <meshLambertMaterial color="#D1D5DB" />
                </Cylinder>
              </>
            )}

            {/* Lower Rods */}
            <Cylinder args={[0.03, 0.03, 0.8, isMobile ? 6 : 10]} position={[0.2, -0.2, 0]}>
               <meshLambertMaterial color="#D1D5DB" />
            </Cylinder>
            <Cylinder args={[0.03, 0.03, 0.8, isMobile ? 6 : 10]} position={[-0.2, -0.2, 0]}>
               <meshLambertMaterial color="#D1D5DB" />
            </Cylinder>

            {/* Coils/Wires - Copper colored */}
            <Torus args={[0.7, 0.015, 6, isMobile ? 12 : 24]} position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshPhongMaterial color="#B87333" shininess={60} specular="#B87333" />
            </Torus>
            <Torus args={[0.3, 0.015, 6, isMobile ? 12 : 24]} position={[0, -1, 0]} rotation={[Math.PI/2, 0, 0]}>
               <meshPhongMaterial color="#B87333" shininess={60} specular="#B87333" />
            </Torus>
            
            {/* Central processor chip simulation at bottom */}
            <Box args={[0.2, 0.05, 0.2]} position={[0, -0.7, 0]}>
                <meshPhongMaterial color="#111" shininess={50} specular="#222" />
            </Box>
          </group>
        </Float>
      </Canvas>
    </div>
  );
};