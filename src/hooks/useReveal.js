import { useEffect } from 'react'

export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          const delay = el.dataset.delay || 0
          setTimeout(() => el.classList.add('visible'), delay * 1000)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' })

    const attach = () => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .char').forEach(el => observer.observe(el))
    }
    attach()
    const obs2 = new MutationObserver(attach)
    obs2.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); obs2.disconnect() }
  }, [])
}
