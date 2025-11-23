import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import api from '../services/api';
import './History.css';

function History() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (filter === 'week') {
        startDate = startOfWeek(new Date());
        endDate = endOfWeek(new Date());
      } else if (filter === 'month') {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      }

      const response = await api.get('/api/assignments', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      setAssignments(response.data);
    } catch (error) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const stats = {};
    assignments.forEach(assignment => {
      const userId = assignment.assignedUser._id;
      if (!stats[userId]) {
        stats[userId] = {
          user: assignment.assignedUser,
          count: 0
        };
      }
      stats[userId].count++;
    });
    return Object.values(stats);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="history-page">
      <h1>Assignment History</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="history-controls">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="history-content">
        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            {getStats().map(stat => (
              <div key={stat.user._id} className="stat-card">
                <h4>{stat.user.name}</h4>
                <p className="count">{stat.count} assignments</p>
              </div>
            ))}
          </div>
        </div>

        <div className="assignments-section">
          <h2>Assignments</h2>
          <div className="assignments-list">
            {assignments.map(assignment => (
              <div key={assignment._id} className="assignment-item">
                <div className="date">
                  {format(new Date(assignment.date), 'MMM d, yyyy')}
                </div>
                <div className="user">
                  {assignment.assignedUser.name}
                  {assignment.isSwapped && (
                    <span className="swapped-badge">Swapped</span>
                  )}
                </div>
                <div className={`status ${assignment.status}`}>
                  {assignment.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;