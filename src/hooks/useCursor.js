import { useEffect } from 'react'

export function useCursor() {
  useEffect(() => {
    // Create cursor elements if not exist
    let dot = document.getElementById('cursor-dot')
    let ring = document.getElementById('cursor-ring')
    if (!dot) {
      dot = document.createElement('div')
      dot.id = 'cursor-dot'
      document.body.appendChild(dot)
    }
    if (!ring) {
      ring = document.createElement('div')
      ring.id = 'cursor-ring'
      document.body.appendChild(ring)
    }

    let mx = 0, my = 0, rx = 0, ry = 0
    let raf

    const move = (e) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx + 'px'
      dot.style.top  = my + 'px'
    }

    const lerp = (a, b, t) => a + (b - a) * t
    const tick = () => {
      rx = lerp(rx, mx, 0.12)
      ry = lerp(ry, my, 0.12)
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      raf = requestAnimationFrame(tick)
    }

    const enter = () => { dot.classList.add('expanded'); ring.classList.add('expanded') }
    const leave = () => { dot.classList.remove('expanded'); ring.classList.remove('expanded') }
    const textOn  = () => ring.classList.add('text-mode')
    const textOff = () => ring.classList.remove('text-mode')

    document.addEventListener('mousemove', move)
    raf = requestAnimationFrame(tick)

    // Hover states
    const addHover = () => {
      document.querySelectorAll('button, a, [data-cursor="pointer"]').forEach(el => {
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
      })
      document.querySelectorAll('p, h1, h2, h3, [data-cursor="text"]').forEach(el => {
        el.addEventListener('mouseenter', textOn)
        el.addEventListener('mouseleave', textOff)
      })
    }
    addHover()
    const obs = new MutationObserver(addHover)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])
}
