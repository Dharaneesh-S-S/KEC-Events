// hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { analyticsAPI, eventAPI, clubAPI } from '../services/analyticsService';

export const useClubAnalytics = (clubId, timeRange = '30days') => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clubId) {
      fetchAnalytics();
    }
  }, [clubId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getClubAnalytics(clubId, timeRange);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, refetch: fetchAnalytics };
};

export const useParticipationTrends = (clubId, timeRange = '30days') => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clubId) {
      fetchTrends();
    }
  }, [clubId, timeRange]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getParticipationTrends(clubId, timeRange);
      setTrends(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch participation trends');
    } finally {
      setLoading(false);
    }
  };

  return { trends, loading, error, refetch: fetchTrends };
};

export const useFormAnalytics = (clubId, eventId = null) => {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clubId) {
      fetchFormData();
    }
  }, [clubId, eventId]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getFormAnalytics(clubId, eventId);
      setFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch form analytics');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, refetch: fetchFormData };
};

export const useClubEvents = (clubId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clubId) {
      fetchEvents();
    }
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getClubEvents(clubId);
      setEvents(response.data.events || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch: fetchEvents };
};

export const useMyClub = () => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyClub();
  }, []);

  const fetchMyClub = async () => {
    try {
      setLoading(true);
      const response = await clubAPI.getMyClubs();
      if (response.data && response.data.length > 0) {
        setClub(response.data[0]);
      } else {
        setError('No club found for this user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch club');
    } finally {
      setLoading(false);
    }
  };

  return { club, loading, error, refetch: fetchMyClub };
};