import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Eye,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { 
  useClubAnalytics, 
  useParticipationTrends, 
  useFormAnalytics, 
  useClubEvents, 
  useMyClub 
} from "../../hooks/useAnalytics";
import { analyticsAPI } from "../../services/analyticsService";


const ClubAnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [exporting, setExporting] = useState(false);

  // Fetch data using hooks
  const { club, loading: clubLoading, error: clubError } = useMyClub();
  const { analytics, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useClubAnalytics(
    club?._id,
    timeRange
  );
  const { trends, loading: trendsLoading } = useParticipationTrends(club?._id, timeRange);
  const { formData, loading: formLoading } = useFormAnalytics(club?._id, selectedEvent !== 'all' ? selectedEvent : null);
  const { events, loading: eventsLoading } = useClubEvents(club?._id);

  // Combine loading states
  const loading = clubLoading || analyticsLoading || eventsLoading;

  // Handle export
  const handleExport = async (format) => {
    if (!club) return;
    
    try {
      setExporting(true);
      const response = await analyticsAPI.exportAnalytics(club._id, format, {
        eventId: selectedEvent !== 'all' ? selectedEvent : null,
        timeRange
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${club.name}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    refetchAnalytics();
  };

  // Prepare events for dropdown
  const eventOptions = [
    { _id: 'all', title: 'All Events' },
    ...(events?.map(event => ({ _id: event._id, title: event.title })) || [])
  ];

  // Error states
  if (clubError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <p className="font-semibold">{clubError}</p>
            <p className="text-sm mt-2">You need to create a club first to view analytics.</p>
          </div>
          <button
            onClick={() => navigate('/club/create-club')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Create Your Club
          </button>
        </div>
      </div>
    );
  }

  if (analyticsError && !clubLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <p>Error loading analytics: {analyticsError}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/club/dashboard')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Event Analytics</h1>
            <p className="text-xl text-gray-600 mt-2">
              {club ? `${club.name} - Insights from form responses and participation` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={eventsLoading}
            >
              {eventOptions.map(event => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {analytics?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEvents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalParticipants}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageParticipation}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-2xl font-bold ${
                      analytics.overview.participationGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.overview.participationGrowth >= 0 ? '+' : ''}{analytics.overview.participationGrowth}%
                    </p>
                    {analytics.overview.participationGrowth >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  analytics.overview.participationGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    analytics.overview.participationGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Event Performance</h3>
              
              {analytics?.eventPerformance && analytics.eventPerformance.length > 0 ? (
                <div className="space-y-4">
                  {analytics.eventPerformance.map((event) => (
                    <div key={event.eventId} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            event.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.trend === 'up' ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Participants</p>
                          <p className="font-semibold text-gray-900">{event.participants}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Views</p>
                          <p className="font-semibold text-gray-900">{event.views}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Conversion</p>
                          <p className="font-semibold text-gray-900">{event.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(event.conversionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No event data available for the selected period.</p>
              )}
            </div>
          </div>

          {/* Response Analytics */}
          <div className="space-y-6">
            {/* Participation Trend */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Participation Trend</h3>
              {trends && trends.length > 0 ? (
                <div className="space-y-3">
                  {trends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{month.participants} participants</span>
                        <span className="text-xs text-gray-500">{month.events} events</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No trend data available.</p>
              )}
            </div>

            {/* Response Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Response Breakdown</h3>
              {formData && formData.length > 0 ? (
                <div className="space-y-4">
                  {formData.map((response, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">{response.question}</h4>
                      <div className="space-y-2">
                        {Object.entries(response.data).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{key}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="font-medium w-8">{value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No form response data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {formData && formData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Department Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Department Distribution</h3>
              <div className="space-y-3">
                {formData.find(r => r.question === "Department")?.data && 
                  Object.entries(formData.find(r => r.question === "Department").data)
                    .sort(([,a], [,b]) => b - a)
                    .map(([department, percentage], index) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-500'];
                      return (
                        <div key={department} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{department}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${colors[index] || 'bg-gray-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>

            {/* Year-wise Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Year-wise Participation</h3>
              <div className="space-y-3">
                {formData.find(r => r.question === "Year of Study")?.data &&
                  Object.entries(formData.find(r => r.question === "Year of Study").data)
                    .sort(([,a], [,b]) => b - a)
                    .map(([year, percentage], index) => (
                      <div key={year} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{year}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubAnalyticsPage;