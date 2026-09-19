import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `attribute float aSize; attribute float aSeed; varying vec3 vColor; varying float vAlpha; uniform float uExpansion; void main(){ vec3 p=position; float radial=length(p.xz); float outward=smoothstep(0.,8.,radial)*uExpansion; p.xz*=1.+outward*(2.8+aSeed*2.); p.y+=sin(aSeed*20.+uExpansion*8.)*outward*.35; vec4 mvPosition=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mvPosition; gl_PointSize=aSize*(1.+uExpansion*(1.+aSeed))*(100./-mvPosition.z); vColor=color*(1.+uExpansion*.8); vAlpha=.35+aSeed*.65; }`
const fragmentShader = `varying vec3 vColor; varying float vAlpha; void main(){ float d=distance(gl_PointCoord,vec2(.5)); float glow=smoothstep(.5,0.,d); gl_FragColor=vec4(vColor,glow*vAlpha); }`

function randomGenerator(seed) { let state = seed >>> 0; return () => { state += 0x6D2B79F5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296 } }

function createGalaxy(count) {
  const random = randomGenerator(2908); const positions = new Float32Array(count * 3); const colors = new Float32Array(count * 3); const sizes = new Float32Array(count); const seeds = new Float32Array(count)
  const warm = new THREE.Color('#ffe5ab'); const ivory = new THREE.Color('#fff8e7'); const violet = new THREE.Color('#8e98d4'); const tone = new THREE.Color()
  for (let index = 0; index < count; index += 1) {
    const core = index < count * .34; const radius = core ? Math.pow(random(), 2.8) * 2.05 : 1.1 + Math.pow(random(), 1.55) * 8.6; const arm = Math.floor(random() * 4) * (Math.PI / 2); const angle = arm + radius * .84 + (random() - .5) * (.24 + radius * .14); const point = index * 3
    positions[point] = Math.cos(angle) * radius + (random() - .5) * .16; positions[point + 1] = (random() - .5) * (core ? .22 : .1 + radius * .055); positions[point + 2] = Math.sin(angle) * radius + (random() - .5) * .16
    tone.copy(core ? warm : (random() > .72 ? violet : ivory)).lerp(ivory, random() * .42); colors[point] = tone.r; colors[point + 1] = tone.g; colors[point + 2] = tone.b; sizes[index] = core ? .85 + random() * 1.7 : .4 + random() * 1.3; seeds[index] = random()
  }
  return { positions, colors, sizes, seeds }
}

function Core({ sequence }) {
  const core = useRef(); const halo = useRef()
  useFrame(() => { const dive = Math.max(0, (sequence.current - .7) / .3); if (core.current) core.current.material.opacity = .18 + dive * .82; if (halo.current) { halo.current.material.opacity = .05 + dive * .7; halo.current.scale.setScalar(1.4 + dive * 3.8) } })
  return <group rotation={[-Math.PI / 2, 0, 0]}><mesh ref={halo}><circleGeometry args={[1.8, 64]} /><meshBasicMaterial color="#ffe5b0" transparent opacity={.05} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh><mesh ref={core}><circleGeometry args={[.7, 64]} /><meshBasicMaterial color="#fff4d7" transparent opacity={.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group>
}

export default function GalaxyParticles({ sequence }) {
  const points = useRef(); const trails = useRef(); const count = window.matchMedia('(max-width: 700px)').matches ? 1650 : 5200; const galaxy = useMemo(() => createGalaxy(count), [count]); const trailPositions = useMemo(() => new Float32Array(count * 6), [count]); const uniforms = useMemo(() => ({ uExpansion: { value: 0 } }), [])
  useFrame((state, delta) => {
    const expansion = THREE.MathUtils.smoothstep(sequence.current, .38, .9)
    if (points.current) { points.current.rotation.y += delta * (.045 + expansion * .16); points.current.rotation.x = Math.sin(state.clock.elapsedTime * .08) * .025; points.current.material.uniforms.uExpansion.value = expansion }
    if (trails.current) { const attribute = trails.current.geometry.attributes.position; const rotation = points.current?.rotation.y || 0; const cosine = Math.cos(rotation); const sine = Math.sin(rotation); const tail = expansion * expansion * 2.1
      for (let index = 0; index < count; index += 1) { const source = index * 3; const target = index * 6; const x = galaxy.positions[source]; const y = galaxy.positions[source + 1]; const z = galaxy.positions[source + 2]; const radial = Math.hypot(x, z) || 1; const scale = 1 + expansion * (2.8 + galaxy.seeds[index] * 2); const px = (x * cosine - z * sine) * scale; const pz = (x * sine + z * cosine) * scale; trailPositions[target] = px; trailPositions[target + 1] = y; trailPositions[target + 2] = pz; trailPositions[target + 3] = px - (x / radial) * tail; trailPositions[target + 4] = y; trailPositions[target + 5] = pz - (z / radial) * tail }
      attribute.needsUpdate = true; trails.current.material.opacity = expansion * .58 }
  })
  return <group><Core sequence={sequence} /><points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[galaxy.positions, 3]} /><bufferAttribute attach="attributes-color" args={[galaxy.colors, 3]} /><bufferAttribute attach="attributes-aSize" args={[galaxy.sizes, 1]} /><bufferAttribute attach="attributes-aSeed" args={[galaxy.seeds, 1]} /></bufferGeometry><shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} vertexColors /></points><lineSegments ref={trails}><bufferGeometry><bufferAttribute attach="attributes-position" args={[trailPositions, 3]} /></bufferGeometry><lineBasicMaterial color="#fff0c8" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments></group>
}
