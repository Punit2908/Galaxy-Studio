import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import gsap from 'gsap'
import GalaxyParticles from './GalaxyParticles'
import GalaxyCamera from './GalaxyCamera'

export default function GalaxyScene({ fullExperience }) {
  const sequence = useRef(0)
  useEffect(() => { const timeline = gsap.timeline(); if (fullExperience) timeline.to(sequence, { current: .38, duration: 2.55, ease: 'sine.inOut' }).to(sequence, { current: 1, duration: 3.4, ease: 'power3.in' }); else timeline.to(sequence, { current: 1, duration: .8, ease: 'power2.in' }); return () => timeline.kill() }, [fullExperience])
  return <Canvas className="galaxy-canvas" camera={{ position: [0, 14, .65], fov: 46, near: .01, far: 120 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }}><color attach="background" args={['#020204']} /><GalaxyCamera sequence={sequence} /><GalaxyParticles sequence={sequence} /><Stars radius={58} depth={35} count={700} factor={1.25} saturation={0} fade speed={0.08} /></Canvas>
}
