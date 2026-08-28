import { useEffect, useState } from 'react'

/**
 * Usado quando o layout precisa mudar em JavaScript, não só em CSS — caso da
 * altura de linha da lista virtualizada, que o virtualizador precisa saber.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    try {
      return window.matchMedia(query).matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)

    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
