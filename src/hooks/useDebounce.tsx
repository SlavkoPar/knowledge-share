
import { useEffect, useState } from "react";


export const useDebounce = <T extends string>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay])

  return debouncedValue
}