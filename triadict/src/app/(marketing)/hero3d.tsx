"use client"

import { useEffect, useRef } from "react"
import type { Vector3 } from "three"

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let disposed = false

    async function init() {
      const THREE = await import("three")
      if (disposed) return

      const canvas = canvasRef.current
      if (!canvas) return

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      camera.position.z = 4.6

      let raf = 0
      let autoResumeTimer: ReturnType<typeof setTimeout> | null = null

      function resize() {
        const parent = canvas?.parentElement
        if (!parent) return
        const w = parent.clientWidth
        renderer.setSize(w, w, false)
      }
      resize()
      window.addEventListener("resize", resize)

      const apex = new THREE.Vector3(0, 1.1, 0)
      const baseY = -0.55
      const baseR = 1.0
      const base = [
        new THREE.Vector3(0, baseY, baseR),
        new THREE.Vector3(baseR * Math.cos((7 * Math.PI) / 6), baseY, baseR * Math.sin((7 * Math.PI) / 6)),
        new THREE.Vector3(baseR * Math.cos((11 * Math.PI) / 6), baseY, baseR * Math.sin((11 * Math.PI) / 6)),
      ]

      const group = new THREE.Group()

      const nodeGeom = new THREE.SphereGeometry(0.085, 32, 32)
      const coralMat = new THREE.MeshBasicMaterial({ color: 0xE85A2F })
      const inkMat = new THREE.MeshBasicMaterial({ color: 0x0A0A0A })

      const apexNode = new THREE.Mesh(nodeGeom, coralMat)
      apexNode.position.copy(apex)
      group.add(apexNode)

      base.forEach((p) => {
        const n = new THREE.Mesh(nodeGeom, inkMat)
        n.position.copy(p)
        group.add(n)
      })

      const haloGeom = new THREE.SphereGeometry(0.16, 32, 32)
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xE85A2F, transparent: true, opacity: 0.15 })
      const haloMesh = new THREE.Mesh(haloGeom, haloMat)
      haloMesh.position.copy(apex)
      group.add(haloMesh)

      const edgeMat = new THREE.LineBasicMaterial({ color: 0x0A0A0A, transparent: true, opacity: 0.55 })
      function addEdge(a: Vector3, b: Vector3) {
        const g = new THREE.BufferGeometry().setFromPoints([a, b])
        group.add(new THREE.Line(g, edgeMat))
      }
      base.forEach((b) => addEdge(apex, b))
      addEdge(base[0], base[1])
      addEdge(base[1], base[2])
      addEdge(base[2], base[0])

      scene.add(group)

      group.rotation.x = -0.22
      group.rotation.y = 0.45

      let isDragging = false
      let lastX = 0
      let lastY = 0
      let velX = 0
      let velY = 0
      let autoSpin = prefersReduced ? 0 : 0.0045

      function onDown(e: MouseEvent | TouchEvent) {
        isDragging = true
        autoSpin = 0
        if (autoResumeTimer) clearTimeout(autoResumeTimer)
        const p = "touches" in e ? e.touches[0] : e
        lastX = p.clientX
        lastY = p.clientY
        velX = 0
        velY = 0
        if (e.cancelable) e.preventDefault()
      }

      function onMove(e: MouseEvent | TouchEvent) {
        if (!isDragging) return
        const p = "touches" in e ? e.touches[0] : e
        velY = (p.clientX - lastX) * 0.008
        velX = (p.clientY - lastY) * 0.008
        group.rotation.y += velY
        group.rotation.x += velX
        lastX = p.clientX
        lastY = p.clientY
      }

      function onUp() {
        if (!isDragging) return
        isDragging = false
        if (!prefersReduced) {
          autoResumeTimer = setTimeout(() => { autoSpin = 0.0045 }, 2200)
        }
      }

      canvas.addEventListener("mousedown", onDown)
      canvas.addEventListener("touchstart", onDown, { passive: false })
      window.addEventListener("mousemove", onMove)
      window.addEventListener("touchmove", onMove, { passive: true })
      window.addEventListener("mouseup", onUp)
      window.addEventListener("touchend", onUp)

      function animate() {
        if (!isDragging) {
          group.rotation.y += velY * 0.94 + autoSpin
          group.rotation.x += velX * 0.94
          velX *= 0.9
          velY *= 0.9
        }
        renderer.render(scene, camera)
        raf = requestAnimationFrame(animate)
      }
      animate()

      cleanupRef.current = () => {
        cancelAnimationFrame(raf)
        if (autoResumeTimer) clearTimeout(autoResumeTimer)
        window.removeEventListener("resize", resize)
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("touchmove", onMove)
        window.removeEventListener("mouseup", onUp)
        window.removeEventListener("touchend", onUp)
        canvas.removeEventListener("mousedown", onDown)
        canvas.removeEventListener("touchstart", onDown)
        renderer.dispose()
      }
    }

    init()

    return () => {
      disposed = true
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  return <canvas ref={canvasRef} />
}
