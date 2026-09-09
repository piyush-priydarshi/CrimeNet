import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingNetwork({ pointerRef }) {
  const groupRef = useRef()

  // Generate an organic intelligence graph topology
  const { nodes, edges } = useMemo(() => {
    const n = [
      { id: 0, pos: [0, 0.4, 0], size: 0.38, color: '#F59E0B', core: true },
      { id: 1, pos: [-2.2, 1.3, -0.6], size: 0.28, color: '#D97706', core: true },
      { id: 2, pos: [2.4, 0.9, 0.5], size: 0.26, color: '#D97706', core: true },
      { id: 3, pos: [-1.4, -1.5, 0.8], size: 0.25, color: '#F59E0B', core: true },
      { id: 4, pos: [1.8, -1.2, -0.7], size: 0.24, color: '#D97706', core: true },
      { id: 5, pos: [-3.6, -0.2, 0.4], size: 0.16, color: '#78716C' },
      { id: 6, pos: [-2.8, 2.5, 0.2], size: 0.15, color: '#78716C' },
      { id: 7, pos: [0.3, 2.6, -0.5], size: 0.18, color: '#A8A29E' },
      { id: 8, pos: [3.8, 1.8, -0.4], size: 0.16, color: '#78716C' },
      { id: 9, pos: [3.5, -0.4, 0.9], size: 0.17, color: '#A8A29E' },
      { id: 10, pos: [0.5, -2.5, 0.6], size: 0.15, color: '#78716C' },
      { id: 11, pos: [-2.8, -2.6, -0.6], size: 0.16, color: '#78716C' },
      { id: 12, pos: [2.9, -2.2, 0.2], size: 0.14, color: '#78716C' },
      { id: 13, pos: [-0.9, 1.4, 1.1], size: 0.2, color: '#2DD4BF' },
      { id: 14, pos: [1.1, 1.2, -1.2], size: 0.18, color: '#A8A29E' },
      { id: 15, pos: [-0.4, -1.0, -1.0], size: 0.19, color: '#2DD4BF' },
      { id: 16, pos: [1.2, -0.4, 1.3], size: 0.18, color: '#A8A29E' },
    ]

    const e = [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 13], [0, 14], [0, 15], [0, 16],
      [1, 5], [1, 6], [1, 13], [1, 7],
      [2, 8], [2, 9], [2, 14], [2, 16],
      [3, 10], [3, 11], [3, 15], [3, 5],
      [4, 9], [4, 10], [4, 12], [4, 16],
      [6, 7], [7, 14], [8, 9], [10, 12], [11, 15], [13, 16],
    ]

    return { nodes: n, edges: e }
  }, [])

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    // Base gentle rotation
    groupRef.current.rotation.y = t * 0.08 + pointer.x * 0.35
    groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.05 - pointer.y * 0.25
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.08
  })

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map(n => (
        <mesh key={n.id} position={n.pos}>
          <sphereGeometry args={[n.size, 24, 24]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={n.core ? 0.75 : 0.2}
            roughness={0.25}
            metalness={0.4}
          />
          {n.core && (
            <mesh>
              <sphereGeometry args={[n.size * 1.5, 16, 16]} />
              <meshBasicMaterial
                color={n.color}
                wireframe
                transparent
                opacity={0.22}
              />
            </mesh>
          )}
        </mesh>
      ))}

      {/* Edges */}
      {edges.map(([fromIdx, toIdx], i) => {
        const p1 = new THREE.Vector3(...nodes[fromIdx].pos)
        const p2 = new THREE.Vector3(...nodes[toIdx].pos)
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2])
        const isCore = nodes[fromIdx].core && nodes[toIdx].core
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={isCore ? '#F59E0B' : '#78716C'}
              transparent
              opacity={isCore ? 0.45 : 0.18}
            />
          </line>
        )
      })}
    </group>
  )
}

export default function LandingHero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[8, 8, 8]} intensity={1.8} color="#F59E0B" />
        <pointLight position={[-8, -6, -4]} intensity={0.8} color="#2DD4BF" />
        <FloatingNetwork />
      </Canvas>
    </div>
  )
}
