import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
attribute float aSize;
attribute float aRadius;
attribute float aTwinkle;
varying vec3 vColor;
varying float vTwinkle;
uniform float uExpansion;
uniform float uTime;

void main() {
  vec3 p = position;
  float radial = length(p.xz);
  float edge = smoothstep(1.5, 12.0, radial);
  float burst = uExpansion * (1.7 + edge * 6.8);
  vec2 radialDir = normalize(p.xz + vec2(0.0001));
  p.xz += radialDir * burst;
  p.y += sin(uTime * 0.55 + aTwinkle * 31.0) * 0.012;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depth = max(1.0, -mvPosition.z);
  gl_PointSize = clamp(aSize * (255.0 / depth) * (1.0 + uExpansion * 0.72), 0.5, 17.0);
  vColor = color;
  vTwinkle = aTwinkle;
}
`

const fragmentShader = `
varying vec3 vColor;
varying float vTwinkle;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = 1.0 - smoothstep(0.0, 0.5, d);
  float halo = pow(core, 3.2);
  float sparkle = 0.82 + 0.18 * sin(vTwinkle * 40.0);
  gl_FragColor = vec4(vColor * (1.0 + halo * 0.55), halo * sparkle);
}
`

const nebulaVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const nebulaFragment = `
varying vec2 vUv;
uniform float uTime;
uniform float uExpansion;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float angle = atan(p.y, p.x);

  float disc = 1.0 - smoothstep(0.12, 1.02, r);
  float softEdge = 1.0 - smoothstep(0.62, 1.0, r);

  float n1 = noise(p * 4.5 + uTime * 0.012);
  float n2 = noise(p * 10.0 - uTime * 0.008);

  float spiralA = 0.5 + 0.5 * sin(angle * 5.0 + r * 13.0 - uTime * 0.025);
  float spiralB = 0.5 + 0.5 * sin(angle * 5.0 + r * 18.0 + 1.4);
  float arms = pow(max(spiralA * 0.78 + spiralB * 0.22, 0.0), 5.0);

  float dust = smoothstep(0.24, 0.8, n1 * 0.72 + n2 * 0.28);
  float cloud = arms * dust * softEdge;\n  float secondaryCloud = pow(max(0.0, 0.5 + 0.5 * sin(angle * 5.0 + r * 8.5 + 2.2)), 7.0) * noise(p * 6.5 - uTime * 0.006) * softEdge;

  vec3 blue = vec3(0.08, 0.30, 0.95);
  vec3 cyan = vec3(0.04, 0.78, 0.95);
  vec3 violet = vec3(0.42, 0.10, 0.95);
  vec3 magenta = vec3(0.90, 0.10, 0.55);
  vec3 gold = vec3(1.0, 0.42, 0.12);

  float hueMix = 0.5 + 0.5 * sin(angle + r * 4.0);
  vec3 color = mix(blue, violet, hueMix);
  color = mix(color, cyan, smoothstep(0.35, 0.85, n1) * 0.62);
  color = mix(color, magenta, smoothstep(0.45, 0.9, spiralB) * 0.32);
  color = mix(color, gold, smoothstep(0.04, 0.45, 1.0 - r) * 0.65);

  float core = pow(max(1.0 - r, 0.0), 4.0);
  float expansionFade = 1.0 - smoothstep(0.68, 1.0, uExpansion);

  float alpha = cloud * 0.58 + secondaryCloud * 0.24 + disc * 0.045 + core * 0.28;
  alpha *= 0.82 + expansionFade * 0.18;

  gl_FragColor = vec4(color * (0.7 + cloud * 1.35 + secondaryCloud * 0.7 + core * 2.2), alpha);
}
`

function randomGenerator(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function createGalaxy(count) {
  const random = randomGenerator(29082026)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const radii = new Float32Array(count)
  const twinkles = new Float32Array(count)

  const ivory = new THREE.Color('#fff7e6')
  const gold = new THREE.Color('#ffc76b')
  const blue = new THREE.Color('#71cfff')
  const violet = new THREE.Color('#9a73ff')
  const magenta = new THREE.Color('#f26bc8')
  const color = new THREE.Color()

  for (let i = 0; i < count; i += 1) {
    const core = random() < 0.32
    const radius = core
      ? Math.pow(random(), 2.7) * 2.15
      : 1.0 + Math.pow(random(), 1.48) * 10.5

    const arm = Math.floor(random() * 5)
    const normalized = radius / 10.5
    const armAngle = (arm / 5) * Math.PI * 2
    const spiral = normalized * 5.4
    const spread = core ? 0.55 : 0.11 + normalized * 0.62
    const angle = armAngle + spiral + (random() - 0.5) * spread

    const point = i * 3
    positions[point] = Math.cos(angle) * radius + (random() - 0.5) * 0.18
    positions[point + 1] = (random() - 0.5) * (core ? 0.34 : 0.07 + normalized * 0.38)
    positions[point + 2] = Math.sin(angle) * radius + (random() - 0.5) * 0.18

    const palette = random()
    if (core) color.copy(gold).lerp(ivory, random() * 0.72)
    else if (palette < 0.25) color.copy(blue).lerp(ivory, random() * 0.45)
    else if (palette < 0.52) color.copy(violet).lerp(blue, random() * 0.45)
    else if (palette < 0.7) color.copy(magenta).lerp(violet, random() * 0.45)
    else color.copy(ivory).lerp(gold, random() * 0.5)

    colors[point] = color.r
    colors[point + 1] = color.g
    colors[point + 2] = color.b

    radii[i] = normalized
    twinkles[i] = random()
    sizes[i] = core ? 1.0 + random() * 2.3 : 0.45 + random() * 1.55
  }

  return { positions, colors, sizes, radii, twinkles }
}

function Nebula({ sequence }) {
  const material = useRef(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uExpansion: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = clock.elapsedTime
    material.current.uniforms.uExpansion.value = sequence.current
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
      <planeGeometry args={[32, 32, 1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function Core({ sequence }) {
  const group = useRef(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const dive = THREE.MathUtils.smoothstep(sequence.current, 0.72, 1)
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.035
    group.current.scale.setScalar((1 + dive * 5.5) * pulse)
  })

  return (
    <group ref={group} renderOrder={3}>
      <mesh>
        <circleGeometry args={[0.78, 64]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={0.94} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={2.9}>
        <circleGeometry args={[0.62, 64]} />
        <meshBasicMaterial color="#ffd47d" transparent opacity={0.11} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={5.8}>
        <circleGeometry args={[0.62, 64]} />
        <meshBasicMaterial color="#7fdfff" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function GalaxyParticles({ sequence }) {
  const points = useRef(null)
  const trails = useRef(null)
  const count = window.matchMedia('(max-width: 700px)').matches ? 8200 : 19000
  const galaxy = useMemo(() => createGalaxy(count), [count])
  const trailPositions = useMemo(() => new Float32Array(980 * 6), [])
  const trailData = useMemo(() => {
    const random = randomGenerator(9042)
    return Array.from({ length: 980 }, () => ({
      angle: random() * Math.PI * 2,
      radius: 1.8 + random() * 11.5,
      height: (random() - 0.5) * 0.55,
      length: 0.35 + random() * 1.7,
    }))
  }, [])

  const uniforms = useMemo(() => ({
    uExpansion: { value: 0 },
    uTime: { value: 0 },
  }), [])

  useFrame(({ clock, gl }, delta) => {
    const expansion = THREE.MathUtils.smoothstep(sequence.current, 0.32, 0.9)

    if (points.current) {
      points.current.rotation.y += delta * (0.018 + expansion * 0.34)
      points.current.rotation.z = Math.sin(clock.elapsedTime * 0.09) * 0.012
      points.current.material.uniforms.uExpansion.value = expansion
      points.current.material.uniforms.uTime.value = clock.elapsedTime
    }

    if (trails.current) {
      const positions = trails.current.geometry.attributes.position.array
      const opacity = THREE.MathUtils.smoothstep(expansion, 0.08, 0.55) * 0.76
      const rotation = points.current?.rotation.y ?? 0
      const cosine = Math.cos(rotation)
      const sine = Math.sin(rotation)

      trailData.forEach((trail, index) => {
        const x = Math.cos(trail.angle) * trail.radius
        const z = Math.sin(trail.angle) * trail.radius
        const scale = 1 + expansion * (2.0 + trail.radius * 0.22)
        const sx = (x * cosine - z * sine) * scale
        const sz = (x * sine + z * cosine) * scale
        const direction = Math.hypot(sx, sz) || 1
        const tail = trail.length * expansion * (1.15 + trail.radius * 0.19)
        const point = index * 6

        positions[point] = sx
        positions[point + 1] = trail.height
        positions[point + 2] = sz
        positions[point + 3] = sx - (sx / direction) * tail
        positions[point + 4] = trail.height
        positions[point + 5] = sz - (sz / direction) * tail
      })

      trails.current.geometry.attributes.position.needsUpdate = true
      trails.current.material.opacity = THREE.MathUtils.damp(trails.current.material.opacity, opacity, 5, delta)
    }

    if (gl?.domElement) gl.domElement.style.transform = 'translateZ(0)'
  })

  return (
    <group>
      <Nebula sequence={sequence} />
      <Core sequence={sequence} />

      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[galaxy.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[galaxy.colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[galaxy.sizes, 1]} />
          <bufferAttribute attach="attributes-aRadius" args={[galaxy.radii, 1]} />
          <bufferAttribute attach="attributes-aTwinkle" args={[galaxy.twinkles, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
        />
      </points>

      <lineSegments ref={trails}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#d9f4ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}
