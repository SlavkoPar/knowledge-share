export const formatDate = (date: Date) => date
  ? new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString()
  : "";

export const formatDateShort = (date: Date) => date
  ? (new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }))
  : "";

export const escapeRegexCharacters = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// export const debounce = (fn, delay) => {
//   let timerId;
//   return (...args) => {
//       clearTimeout(timerId);
//       timerId = setTimeout(() => fn(...args), delay);
//   }
// };

export function debounce<T extends Function>(cb: T, wait = 20) {
  let h: ReturnType<typeof setTimeout>;
  let callable = (...args: any) => {
      clearTimeout(h);
      h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}

// usage
//let f = debounce((a: string, b: number, c?: number) => console.log(a.length + b + c || 0));