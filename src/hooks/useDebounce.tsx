
import { useEffect, useState } from "react";


export const useDebounce = <T extends string>(Id: string, Value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState({Id, Value});

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue({Id, Value});
    }, delay);

    return () => clearTimeout(timeout);
  }, [Id, Value, delay])

  return debouncedValue;
}