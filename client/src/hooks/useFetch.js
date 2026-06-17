import { useState, useEffect } from 'react';
import api from '../api/client.js';

export function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError('');
    api.get(url)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load data.'))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
