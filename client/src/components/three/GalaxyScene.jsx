import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import GalaxyParticles from './GalaxyParticles'
import GalaxyCamera from './GalaxyCamera'

function GalaxyWorld({ sequence }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 12.8, 0.55)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame(() => {
    camera.fov = THREE.MathUtils.damp(
      camera.fov,
      THREE.MathUtils.lerp(46, 64, sequence.current),
      3,
      1 / 60,
    )
    camera.updateProjectionMatrix()
  })

  return (
    <>
      <GalaxyCamera sequence={sequence} />
      <GalaxyParticles sequence={sequence} />
      <Stars radius={72} depth={52} count={1250} factor={1.5} saturation={0.28} fade speed={0.06} />
    </>
  )
}

export default function GalaxyScene({ fullExperience }) {
  const sequence = useRef(0)

  useEffect(() => {
    const timeline = gsap.timeline()

    if (fullExperience) {
      timeline
        .to(sequence, { current: 0.2, duration: 1.55, ease: 'sine.inOut' })
        .to(sequence, { current: 0.48, duration: 1.35, ease: 'sine.inOut' })
        .to(sequence, { current: 1, duration: 3.1, ease: 'power4.in' })
    } else {
      timeline.to(sequence, { current: 1, duration: 0.7, ease: 'power2.in' })
    }

    return () => timeline.kill()
  }, [fullExperience])

  return (
    <Canvas
      className="galaxy-canvas"
      camera={{ position: [0, 12.8, 0.55], fov: 46, near: 0.01, far: 180 }}
      dpr={[1, 1.55]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.3
        gl.setClearColor('#020204', 1)
      }}
    >
      <color attach="background" args={['#020204']} />
      <GalaxyWorld sequence={sequence} />
    </Canvas>
  )
}
