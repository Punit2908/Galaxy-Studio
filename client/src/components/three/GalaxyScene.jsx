import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import GalaxyParticles from './GalaxyParticles'
import GalaxyCamera from './GalaxyCamera'

function GalaxyWorld({ sequence }) {
  const { camera } = useThree()
  useEffect(() => { camera.position.set(0, 15.5, 0.7); camera.lookAt(0, 0, 0) }, [camera])
  useFrame(() => { camera.fov = THREE.MathUtils.damp(camera.fov, THREE.MathUtils.lerp(48, 62, sequence.current), 3, 1 / 60); camera.updateProjectionMatrix() })
  return <><GalaxyCamera sequence={sequence} /><GalaxyParticles sequence={sequence} /><Stars radius={64} depth={45} count={950} factor={1.35} saturation={0.18} fade speed={0.04} /></>
}
export default function GalaxyScene({ fullExperience }) {
  const sequence = useRef(0)
  useEffect(() => {
    const timeline = gsap.timeline()
    if (fullExperience) timeline.to(sequence, { current: 0.2, duration: 1.55, ease: 'sine.inOut' }).to(sequence, { current: 0.48, duration: 1.35, ease: 'sine.inOut' }).to(sequence, { current: 1, duration: 3.1, ease: 'power4.in' })
    else timeline.to(sequence, { current: 1, duration: 0.7, ease: 'power2.in' })
    return () => timeline.kill()
  }, [fullExperience])
  return <Canvas className="galaxy-canvas" camera={{ position: [0, 15.5, 0.7], fov: 48, near: 0.01, far: 150 }} dpr={[1, 1.55]} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.18; gl.setClearColor('#020204', 1) }}><color attach="background" args={['#020204']} /><GalaxyWorld sequence={sequence} /></Canvas>
}
