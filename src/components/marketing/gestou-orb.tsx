'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Paleta Leve: gradiente do leve-azul escuro ao leve-verde teal,
// com calor passando por teal claro até branco quando o cursor está perto.
const PALETTE = {
  dark: new THREE.Color(0x020a0b),
  base: new THREE.Color(0x0a3a37),
  baseBright: new THREE.Color(0x16695f),
  cyan: new THREE.Color(0x20c4a6),
  yellow: new THREE.Color(0x7be8d0),
  yellowLight: new THREE.Color(0xbff5e5),
  hot: new THREE.Color(0xffffff),
}

const ORB_RADIUS = 2.0
const SPHERE_SIZE = 0.17
const RINGS = 24
const PER_RING_BASE = 34
const LIGHT_DIR = new THREE.Vector3(0.75, 0.25, 0.6).normalize()

export function GestouOrb({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.NoToneMapping

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 8.2)
    camera.lookAt(0, 0, 0)

    function resize() {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const points: THREE.Vector3[] = []
    for (let i = 0; i < RINGS; i++) {
      const lat = Math.PI * (i / (RINGS - 1))
      const y = Math.cos(lat)
      const r = Math.sin(lat)
      const count = Math.max(4, Math.round(PER_RING_BASE * r))
      for (let j = 0; j < count; j++) {
        const lon = (j / count) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(lon) * r, y, Math.sin(lon) * r))
      }
    }
    const N = points.length

    const geo = new THREE.SphereGeometry(SPHERE_SIZE, 28, 28)
    const posAttr = geo.attributes.position
    const shadingColors = new Float32Array(posAttr.count * 3)
    const LIGHT_LOCAL = new THREE.Vector3(0.4, 0.85, 0.35).normalize()
    for (let i = 0; i < posAttr.count; i++) {
      const nx = posAttr.getX(i) / SPHERE_SIZE
      const ny = posAttr.getY(i) / SPHERE_SIZE
      const nz = posAttr.getZ(i) / SPHERE_SIZE
      const dot = nx * LIGHT_LOCAL.x + ny * LIGHT_LOCAL.y + nz * LIGHT_LOCAL.z
      let lambert = dot * 0.5 + 0.5
      lambert = 0.08 + lambert * 0.92
      lambert = Math.pow(lambert, 1.4)
      const specCone = Math.max(0, dot)
      const spec = Math.pow(specCone, 60) * 1.8
      const specHalo = Math.pow(specCone, 14) * 0.35
      const rimDist = Math.sqrt(nx * nx + ny * ny)
      const rimFactor = Math.pow(rimDist, 3.5)
      const rimDarken = 1.0 - rimFactor * 0.5
      const value = Math.min(1.0, (lambert + spec + specHalo) * rimDarken)
      shadingColors[i * 3] = value
      shadingColors[i * 3 + 1] = value
      shadingColors[i * 3 + 2] = value
    }
    geo.setAttribute('color', new THREE.BufferAttribute(shadingColors, 3))

    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      toneMapped: false,
    })
    const mesh = new THREE.InstancedMesh(geo, mat, N)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3)
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    scene.add(mesh)

    const raycaster = new THREE.Raycaster()
    const mouseNDC = new THREE.Vector2(2, 2)
    const mouseHitPoint = new THREE.Vector3(10, 10, 10)
    let mouseActive = false

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      mouseActive = true
    }
    const onMouseLeave = () => {
      mouseActive = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const rect = container.getBoundingClientRect()
        mouseNDC.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1
        mouseNDC.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1
        mouseActive = true
      }
    }
    const onTouchEnd = () => {
      mouseActive = false
    }
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd)

    function updateMouseHit() {
      raycaster.setFromCamera(mouseNDC, camera)
      const ro = raycaster.ray.origin
      const rd = raycaster.ray.direction
      const R = ORB_RADIUS * 1.02
      const b = ro.dot(rd)
      const c = ro.dot(ro) - R * R
      const disc = b * b - c
      if (disc < 0) return false
      const t = -b - Math.sqrt(disc)
      mouseHitPoint.copy(rd).multiplyScalar(t).add(ro)
      return true
    }

    const dummy = new THREE.Object3D()
    const tmpColor = new THREE.Color()
    const offsets = new Float32Array(N)
    const heat = new Float32Array(N)
    const INFLUENCE_RADIUS = 0.9
    const MAX_PUSH = 1.0

    const clock = new THREE.Clock()
    let rafId = 0

    function animate() {
      const t = clock.getElapsedTime()
      const yaw = t * 0.55
      const pitch = Math.sin(t * 0.35) * 0.45
      const cosY = Math.cos(yaw),
        sinY = Math.sin(yaw)
      const cosX = Math.cos(pitch),
        sinX = Math.sin(pitch)
      const hasHit = mouseActive ? updateMouseHit() : false

      for (let i = 0; i < N; i++) {
        const p = points[i]
        let rx = p.x * cosY + p.z * sinY
        let rz = -p.x * sinY + p.z * cosY
        let ry = p.y
        const ry2 = ry * cosX - rz * sinX
        const rz2 = ry * sinX + rz * cosX
        ry = ry2
        rz = rz2

        const baseX = rx * ORB_RADIUS
        const baseY = ry * ORB_RADIUS
        const baseZ = rz * ORB_RADIUS

        let targetOffset = 0,
          proximity = 0
        if (hasHit) {
          const dx = baseX - mouseHitPoint.x
          const dy = baseY - mouseHitPoint.y
          const dz = baseZ - mouseHitPoint.z
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (d < INFLUENCE_RADIUS) {
            proximity = 1 - d / INFLUENCE_RADIUS
            proximity = proximity * proximity * (3 - 2 * proximity)
            const pushCurve = Math.max(0, (proximity - 0.5) / 0.5)
            targetOffset = pushCurve * pushCurve * MAX_PUSH
          }
        }

        const current = offsets[i]
        const lerp = targetOffset > current ? 0.32 : 0.045
        offsets[i] = current + (targetOffset - current) * lerp
        const off = offsets[i]

        const targetHeat = proximity
        const hLerp = targetHeat > heat[i] ? 0.45 : 0.018
        heat[i] = heat[i] + (targetHeat - heat[i]) * hLerp
        const h = heat[i]

        dummy.position.set(baseX + rx * off, baseY + ry * off, baseZ + rz * off)
        dummy.scale.setScalar(1 + off * 0.15)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        const rawDot = rx * LIGHT_DIR.x + ry * LIGHT_DIR.y + rz * LIGHT_DIR.z
        const litAmount = Math.pow((rawDot + 1) * 0.5, 3.5)
        tmpColor.copy(PALETTE.dark).lerp(PALETTE.base, litAmount)
        if (litAmount > 0.7) {
          tmpColor.lerp(PALETTE.baseBright, ((litAmount - 0.7) / 0.3) * 0.25)
        }
        if (h > 0.01) {
          let reactColor: THREE.Color
          if (h < 0.25) reactColor = tmpColor.clone().lerp(PALETTE.cyan, h / 0.25)
          else if (h < 0.55) reactColor = PALETTE.cyan.clone().lerp(PALETTE.yellow, (h - 0.25) / 0.3)
          else if (h < 0.8)
            reactColor = PALETTE.yellow.clone().lerp(PALETTE.yellowLight, (h - 0.55) / 0.25)
          else reactColor = PALETTE.yellowLight.clone().lerp(PALETTE.hot, (h - 0.8) / 0.2)
          tmpColor.lerp(reactColor, Math.min(1, h * 1.3))
        }
        mesh.instanceColor!.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor!.needsUpdate = true
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className={`gestou-orb-container ${className ?? ''}`}>
      <canvas ref={canvasRef} />
    </div>
  )
}
