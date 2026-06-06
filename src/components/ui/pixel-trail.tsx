import React, { useMemo, useRef, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface PixelTrailProps {
  pixelSize?: number
  fadeDuration?: number
  pixelColor?: string
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 56,
  fadeDuration = 900,
  pixelColor = 'rgba(196, 132, 92, 0.6)',
}) => {
  const trailId = useRef(uuidv4())
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.floor(e.clientX / pixelSize)
      const y = Math.floor(e.clientY / pixelSize)
      const el = document.getElementById(`${trailId.current}-px-${x}-${y}`) as HTMLDivElement | null
      if (!el) return

      // Cancel any running animation by cloning, then re-trigger
      el.style.transition = 'none'
      el.style.opacity = '1'
      // Force reflow so the opacity: 1 is painted before the transition kicks in
      void el.offsetHeight
      el.style.transition = `opacity ${fadeDuration}ms ease-out`
      el.style.opacity = '0'
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [pixelSize, fadeDuration])

  const columns = useMemo(() => Math.ceil(dimensions.width / pixelSize), [dimensions.width, pixelSize])
  const rows = useMemo(() => Math.ceil(dimensions.height / pixelSize), [dimensions.height, pixelSize])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`${colIndex}-${rowIndex}`}
              id={`${trailId.current}-px-${colIndex}-${rowIndex}`}
              style={{
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                borderRadius: '50%',
                background: pixelColor,
                flexShrink: 0,
                opacity: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { PixelTrail }
