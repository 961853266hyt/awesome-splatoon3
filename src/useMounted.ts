import { useEffect, useState } from 'react';

/**
 * False while prerendering and during the first client render, true from the
 * first effect onwards.
 *
 * Gate anything non-deterministic behind it -- clocks, animations, randomness,
 * `navigator` checks -- so the markup React hydrates against is byte-identical
 * to what the prerender produced.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
