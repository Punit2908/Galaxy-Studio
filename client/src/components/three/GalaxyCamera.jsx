import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GalaxyCamera({ sequence }) {
  const { camera } = useThree()
  const target = new THREE.Vector3()

  useFrame(({ clock }, delta) => {
    const dive = THREE.MathUtils.smoothstep(sequence.current, 0.46, 1)
    const drift = Math.sin(clock.elapsedTime * 0.17) * 0.1

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      drift + dive * 0.08,
      2.5,
      delta,
    )
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      THREE.MathUtils.lerp(12.8, 0.68, dive),
      3.2,
      delta,
    )
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      THREE.MathUtils.lerp(0.55, 0.14, dive),
      3.2,
      delta,
    )

    target.set(0, 0, 0)
    camera.lookAt(target)
  })

  return null
}
