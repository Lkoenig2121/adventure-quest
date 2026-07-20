import { useEffect } from 'react'

// Lets the arrow/page keys scroll a container as soon as a screen mounts,
// without requiring the user to click inside it first.
export function useArrowScroll(ref, amount = 90) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const el = ref.current
      if (!el) return
      // Don't hijack arrow keys while the user is typing into a form field.
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        el.scrollBy({ top: amount, behavior: 'smooth' })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        el.scrollBy({ top: -amount, behavior: 'smooth' })
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        el.scrollBy({ top: el.clientHeight * 0.9, behavior: 'smooth' })
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        el.scrollBy({ top: -el.clientHeight * 0.9, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ref, amount])
}
