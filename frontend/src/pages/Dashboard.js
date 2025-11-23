import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [todayAssignment, setTodayAssignment] = useState(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, usersRes, upcomingRes] = await Promise.all([
        api.get('/api/assignments/today'),
        api.get('/api/users'),
        api.get('/api/assignments/upcoming')
      ]);

      setTodayAssignment(todayRes.data);
      // Sort users by sequence
      const sortedUsers = usersRes.data.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      setUsers(sortedUsers);
      setUpcomingAssignments(upcomingRes.data);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.patch(`/api/assignments/${todayAssignment._id}/complete`);
      setTodayAssignment({ ...todayAssignment, status: 'completed' });
    } catch (error) {
      setError('Failed to mark assignment as complete');
    }
  };

  const handleSwap = async (swapWithUserId) => {
    try {
      const response = await api.post(`/api/assignments/${todayAssignment._id}/swap`, {
        swapWithUserId
      });
      setTodayAssignment(response.data);
    } catch (error) {
      setError('Failed to swap assignment');
    }
  };

  // Get tomorrow's assignment from upcoming list
  const getTomorrowAssignment = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = tomorrow.toDateString();
    return upcomingAssignments.find(a => new Date(a.date).toDateString() === tomorrowStr);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>आज पेपर कोन उठाएगा ? </h1>
      
      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="today-section">
          <h2>Today's Assignment ({format(new Date(), 'MMM d, yyyy')})</h2>
          {todayAssignment ? (
            <div className="assignment-card">
              <div className="user-info">
                <h3>{todayAssignment.assignedUser.name}</h3>
                <p>Email: {todayAssignment.assignedUser.email}</p>
                {todayAssignment.assignedUser.phone && (
                  <p>Phone: {todayAssignment.assignedUser.phone}</p>
                )}
              </div>
              <div className="assignment-actions">
                <button 
                  onClick={handleMarkComplete}
                  disabled={todayAssignment.status === 'completed'}
                  className="btn btn-primary"
                >
                  {todayAssignment.status === 'completed' ? 'Completed' : 'Mark Complete'}
                </button>
                
                <div className="swap-section">
                  <select 
                    onChange={(e) => handleSwap(e.target.value)}
                    className="swap-select"
                  >
                    <option value="">Swap with...</option>
                    {users
                      .filter(user => user._id !== todayAssignment.assignedUser._id)
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-assignment">No assignment for today</div>
          )}
        </div>

        {getTomorrowAssignment() && (
          <div className="tomorrow-section">
            <h2>Tomorrow's Assignment ({format(new Date(getTomorrowAssignment().date), 'MMM d, yyyy')})</h2>
            {getTomorrowAssignment().isHoliday ? (
              <div className="assignment-card">
                <div className="user-info">
                  <h3>Holiday 🎉</h3>
                  <p>No assignment scheduled</p>
                </div>
              </div>
            ) : (
              <div className="assignment-card">
                <div className="user-info">
                  <h3>{getTomorrowAssignment().assignedUser?.name}</h3>
                  <p>Email: {getTomorrowAssignment().assignedUser?.email}</p>
                  {getTomorrowAssignment().assignedUser?.phone && (
                    <p>Phone: {getTomorrowAssignment().assignedUser?.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="upcoming-section">
          <h2>Upcoming Assignments</h2>
          <div className="upcoming-list">
            {upcomingAssignments.map((assignment, index) => (
              <div key={index} className="upcoming-item">
                <div className="date">
                  {format(new Date(assignment.date), 'EEE, MMM d')}
                </div>
                <div className={`user ${assignment.isHoliday ? 'holiday' : ''}`}>
                  {assignment.isHoliday ? 'Holiday' : (assignment.assignedUser ? assignment.assignedUser.name : 'TBD')}
                </div>
                {/* {!assignment.isHoliday && assignment.assignedUser && (
                  <div className="confirm-button">
                    {savedDateStr === new Date(assignment.date).toDateString() ? (
                      <button className="btn btn-success" disabled>✓ Saved</button>
                    ) : (
                      <button 
                        className="btn" 
                        onClick={() => handleConfirmUpcoming(assignment)}
                        disabled={confirmingDateStr === new Date(assignment.date).toDateString()}
                      >
                        {confirmingDateStr === new Date(assignment.date).toDateString() ? 'Confirming...' : 'Confirm'}
                      </button>
                    )}
                  </div>
                )} */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;