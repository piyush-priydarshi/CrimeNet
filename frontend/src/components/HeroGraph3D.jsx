import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function FloatingNode({ position, color, size, speed }) {
  const ref = useRef()
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset
    ref.current.position.y += Math.sin(t) * 0.0015
    ref.current.rotation.x += 0.003
    ref.current.rotation.y += 0.005
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.4} metalness={0.2} />
    </mesh>
  )
}

function ConnectionLine({ start, end, color }) {
  const points = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    return [s, e]
  }, [start, end])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    return g
  }, [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.18} />
    </line>
  )
}

function NetworkScene() {
  const nodes = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
      ],
      color: i % 4 === 0 ? '#38bdf8' : '#64748b',
      size: i % 4 === 0 ? 0.22 : 0.12,
      speed: 0.2 + Math.random() * 0.3,
    }))
  , [])

  const edges = useMemo(() =>
    Array.from({ length: 42 }, () => {
      const a = Math.floor(Math.random() * nodes.length)
      const b = Math.floor(Math.random() * nodes.length)
      return { a, b }
    }).filter(e => e.a !== e.b)
  , [nodes])

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#38bdf8" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#0f172a" />
      {nodes.map(n => (
        <FloatingNode key={n.id} position={n.position} color={n.color} size={n.size} speed={n.speed} />
      ))}
      {edges.map((e, i) => (
        <ConnectionLine
          key={i}
          start={nodes[e.a].position}
          end={nodes[e.b].position}
          color="#38bdf8"
        />
      ))}
      <OrbitControls autoRotate autoRotateSpeed={0.35} enableZoom={false} enablePan={false} />
    </>
  )
}

export default function HeroGraph3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 16], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <NetworkScene />
      </Canvas>
    </div>
  )
}
