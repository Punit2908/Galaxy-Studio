import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GalaxyCamera({ sequence }) {
  const { camera, pointer } = useThree(); const lookAt = new THREE.Vector3()
  useFrame((state, delta) => { const dive = THREE.MathUtils.smoothstep(sequence.current, .5, 1); const drift = Math.sin(state.clock.elapsedTime * .22) * .12; const targetHeight = THREE.MathUtils.lerp(14, 1.25, dive); camera.position.x += ((pointer.x * .22) + drift - camera.position.x) * delta * .42; camera.position.z += ((pointer.y * .18) + .65 - camera.position.z) * delta * .42; camera.position.y += (targetHeight - camera.position.y) * delta * (1.1 + dive * 2.2); lookAt.set(0, 0, 0); camera.lookAt(lookAt) })
  return null
}
