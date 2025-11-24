// hooks/useEvents.js
import { useState, useEffect } from 'react';
import { eventAPI, clubAPI } from '../services/eventService';

export const useEvents = (params = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [params]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvents(params);
      setEvents(response.data.events || response.data);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, pagination, refetch: fetchEvents };
};

export const useClubEvents = (clubId, params = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (clubId) {
      fetchClubEvents();
    }
  }, [clubId, params]);

  const fetchClubEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getClubEvents(clubId, params);
      setEvents(response.data.events || response.data);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch club events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, pagination, refetch: fetchClubEvents };
};

export const useUpcomingEvents = (limit = 5) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [limit]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getUpcomingEvents(limit);
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch upcoming events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch: fetchUpcomingEvents };
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
        setClub(response.data[0]); // Assuming user has one club
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