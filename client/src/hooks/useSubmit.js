import { useState } from 'react';
import api from '../api/client.js';

export function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function submit(method, url, data, onSuccess) {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api[method](url, data);
      if (onSuccess) onSuccess(res.data);
      setSuccess('Done successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, error, success, setError, setSuccess };
}
