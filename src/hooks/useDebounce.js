import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce any fast-changing value
 * @param {any} value Value to debounce
 * @param {number} delay Milliseconds to delay
 * @returns Debounced value
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

