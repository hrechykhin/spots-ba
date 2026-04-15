import { useState, useEffect } from 'react'

const KEY = 'spots-ba-favorites'
const EVENT = 'spots-ba-favorites-change'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(load)

  useEffect(() => {
    function onUpdate() {
      setFavorites(load())
    }
    window.addEventListener(EVENT, onUpdate)
    return () => window.removeEventListener(EVENT, onUpdate)
  }, [])

  function toggle(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      window.dispatchEvent(new Event(EVENT))
      return next
    })
  }

  function isFavorite(id: string) {
    return favorites.has(id)
  }

  return { favorites, toggle, isFavorite }
}
