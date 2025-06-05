import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { QubitState, ComplexNumber } from '../../types';

interface BlochSphere3DProps {
  qubitState: QubitState;
  isAnimating?: boolean;
}

// Helper to calculate Bloch sphere coordinates from complex alpha and beta
// Standard Bloch sphere mapping: |0⟩ at north pole (0,0,1), |1⟩ at south pole (0,0,-1)
// |+⟩ = (|0⟩ + |1⟩)/√2 at (1,0,0), |-⟩ = (|0⟩ - |1⟩)/√2 at (-1,0,0)
// |+i⟩ = (|0⟩ + i|1⟩)/√2 at (0,1,0), |-i⟩ = (|0⟩ - i|1⟩)/√2 at (0,-1,0)
const stateToBlochCoordinates = (alpha: ComplexNumber, beta: ComplexNumber): [number, number, number] => {
  // Normalize the state vector
  const norm = Math.sqrt(
    alpha.re * alpha.re + alpha.im * alpha.im + 
    beta.re * beta.re + beta.im * beta.im
  );
  
  const normAlpha = { re: alpha.re / norm, im: alpha.im / norm };
  const normBeta = { re: beta.re / norm, im: beta.im / norm };
  
  // Standard Bloch sphere coordinates for state |ψ⟩ = α|0⟩ + β|1⟩
  // These formulas are the standard quantum mechanical Bloch sphere mapping
  const x = 2 * (normAlpha.re * normBeta.re + normAlpha.im * normBeta.im);
  const y = 2 * (normAlpha.im * normBeta.re - normAlpha.re * normBeta.im);
  const z = (normAlpha.re * normAlpha.re + normAlpha.im * normAlpha.im) - 
            (normBeta.re * normBeta.re + normBeta.im * normBeta.im);
  
  console.log(`Bloch calculation: α=(${normAlpha.re.toFixed(4)}, ${normAlpha.im.toFixed(4)}i), β=(${normBeta.re.toFixed(4)}, ${normBeta.im.toFixed(4)}i)`);
  console.log(`Bloch coordinates: x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}`);
  
  // Direct mapping to Three.js coordinates - no transformation needed
  // Three.js: +X right, +Y up, +Z towards viewer
  // Bloch: +X is |+⟩, +Y is |+i⟩, +Z is |0⟩
  return [x, y, z];
};

const StateVector: React.FC<{ position: [number, number, number]; isAnimating: boolean }> = ({ 
  position, 
  isAnimating 
}) => {
  const vectorRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (vectorRef.current && isAnimating) {
      vectorRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const points = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(...position)
  ], [position]);

  return (
    <group ref={vectorRef}>
      <Line
        points={points}
        color="#ff0066"
        lineWidth={10}
      />
      <mesh position={position}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color="#ff0066" />
      </mesh>
      <mesh position={position}>
        <sphereGeometry args={[0.25]} />
        <meshBasicMaterial color="#ff0066" transparent opacity={0.2} />
      </mesh>
      <Text
        position={[position[0], position[1] + 0.3, position[2]]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ({position[0].toFixed(2)}, {position[1].toFixed(2)}, {position[2].toFixed(2)})
      </Text>
    </group>
  );
};

const BlochSphereGeometry: React.FC = () => {
  return (
    <>
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial wireframe color="#334155" opacity={0.1} transparent />
      </Sphere>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#475569" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Reference markers - standard Bloch sphere positions */}
      
      {/* |0⟩ reference marker at north pole +Z */}
      <Line points={[[0, 0, 0], [0, 0, 1]]} color="#0099ff" lineWidth={5} />
      <mesh position={[0, 0, 1]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#0099ff" />
      </mesh>
      <Text position={[0, 0, 1.3]} color="#0099ff" fontSize={0.2}>|0⟩</Text>
      
      {/* |1⟩ reference marker at south pole -Z */}
      <Line points={[[0, 0, 0], [0, 0, -1]]} color="#ff0099" lineWidth={5} />
      <mesh position={[0, 0, -1]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0099" />
      </mesh>
      <Text position={[0, 0, -1.3]} color="#ff0099" fontSize={0.2}>|1⟩</Text>
      
      {/* |+⟩ reference marker at +X */}
      <Line points={[[0, 0, 0], [1, 0, 0]]} color="#00ff00" lineWidth={5} />
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <Text position={[1.3, 0, 0]} color="#00ff00" fontSize={0.2}>|+⟩</Text>
      
      {/* |-⟩ reference marker at -X */}
      <Line points={[[0, 0, 0], [-1, 0, 0]]} color="#ff9900" lineWidth={5} />
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff9900" />
      </mesh>
      <Text position={[-1.3, 0, 0]} color="#ff9900" fontSize={0.2}>|-⟩</Text>
      
      {/* |+i⟩ reference marker at +Y */}
      <Line points={[[0, 0, 0], [0, 1, 0]]} color="#00ffff" lineWidth={5} />
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <Text position={[0, 1.3, 0]} color="#00ffff" fontSize={0.2}>|+i⟩</Text>
      
      {/* |-i⟩ reference marker at -Y */}
      <Line points={[[0, 0, 0], [0, -1, 0]]} color="#ff00ff" lineWidth={5} />
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>
      <Text position={[0, -1.3, 0]} color="#ff00ff" fontSize={0.2}>|-i⟩</Text>
      
      {/* Coordinate axes */}
      <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#ef4444" lineWidth={2} />
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#22c55e" lineWidth={2} />
      <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#3b82f6" lineWidth={2} />
      
      {/* Axis labels */}
      <Text position={[1.3, 0, 0]} fontSize={0.15} color="#ef4444" anchorX="center" anchorY="middle">X</Text>
      <Text position={[0, 1.3, 0]} fontSize={0.15} color="#22c55e" anchorX="center" anchorY="middle">Y</Text>
      <Text position={[0, 0, 1.3]} fontSize={0.15} color="#3b82f6" anchorX="center" anchorY="middle">Z</Text>
      
      {/* Remove duplicate state labels - they're already positioned correctly with the reference markers */}
    </>
  );
};

const BlochSphere3D: React.FC<BlochSphere3DProps> = ({ 
  qubitState, 
  isAnimating = false 
}) => {
  const { alpha, beta } = qubitState;
  const stateVectorPosition = useMemo(() => stateToBlochCoordinates(alpha, beta), [alpha, beta]);

  return (
    <div className="w-full h-[500px] rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-quantum-particle">3D Bloch Sphere</h3>
        <p className="text-sm text-quantum-text-secondary">
          Interactive visualization of qubit state
        </p>
      </div>
      
      <div className="h-[420px]">
        <Canvas
          camera={{ position: [4, 3, 4], fov: 50, up: [0, 0, 1] }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <BlochSphereGeometry />
          <StateVector 
            position={stateVectorPosition as [number, number, number]} 
            isAnimating={isAnimating}
          />
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={8}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      
      <div className="p-3 border-t border-slate-700 text-xs text-quantum-text-secondary">
        <div className="flex justify-between">
          <span>Coordinates: ({stateVectorPosition[0].toFixed(3)}, {stateVectorPosition[1].toFixed(3)}, {stateVectorPosition[2].toFixed(3)})</span>
          <span>Drag to rotate • Scroll to zoom</span>
        </div>
        <div className="mt-1 text-xs text-yellow-400">
          Debug: α=({qubitState.alpha.re.toFixed(3)}, {qubitState.alpha.im.toFixed(3)}i), β=({qubitState.beta.re.toFixed(3)}, {qubitState.beta.im.toFixed(3)}i)
        </div>
      </div>
    </div>
  );
};

export default BlochSphere3D;
