import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import GalaxyParticles from './GalaxyParticles'

function World() {
  const { camera } = useThree()
  const group = useRef(null)
  const sequence = useRef(0.08)

  useEffect(() => {
    camera.position.set(0, 6.7, 0.25)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame(({ clock }, delta) => {
    camera.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.08
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 6.7, 2, delta)
    camera.lookAt(0, 0, 0)
    if (group.current) group.current.rotation.y += delta * 0.018
  })

  return (
    <group ref={group} scale={1.55}>
      <GalaxyParticles sequence={sequence} />
      <Stars radius={65} depth={42} count={900} factor={1.35} saturation={0.2} fade speed={0.04} />
    </group>
  )
}

export default function GalaxyHeroScene() {
  return (
    <Canvas className="hero__galaxy" camera={{ position: [0, 6.7, 0.25], fov: 54, near: 0.01, far: 160 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
      gl.outputColorSpace = THREE.SRGBColorSpace
      gl.toneMapping = THREE.ACESFilmicToneMapping
      gl.toneMappingExposure = 1.15
      gl.setClearColor('#020307', 1)
    }}>
      <color attach="background" args={['#020307']} />
      <World />
    </Canvas>
  )
}
