// hooks/useClubs.js
import { useState, useEffect } from 'react';
import { clubAPI } from '../services/clubService';

export const useClubs = (params = {}) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchClubs();
  }, [params]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await clubAPI.getClubs(params);
      setClubs(response.data.clubs || response.data);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  return { clubs, loading, error, pagination, refetch: fetchClubs };
};

export const useClub = (idOrSlug, bySlug = false) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (idOrSlug) {
      fetchClub();
    }
  }, [idOrSlug]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = bySlug 
        ? await clubAPI.getClubBySlug(idOrSlug)
        : await clubAPI.getClubById(idOrSlug);
      setClub(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch club');
    } finally {
      setLoading(false);
    }
  };

  return { club, loading, error, refetch: fetchClub };
};