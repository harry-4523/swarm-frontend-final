import { useRef, useEffect } from 'react'

export function useMagnetic(strength = 0.35) {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const reset = () => { el.style.transform = 'translate(0,0)' }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', reset)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', reset) }
  }, [strength])
  return ref
}
