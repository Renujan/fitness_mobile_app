import { useEffect, useState } from 'react';
import { getDatabase } from '../db/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await getDatabase();
        if (isMounted) {
          setIsReady(true);
        }
      } catch (e: any) {
        console.error('useDatabase initialization failed:', e);
        if (isMounted) {
          setError(e);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isReady, error };
}
