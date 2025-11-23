import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (userId, date) => {
    try {
      await api.post(`/api/users/${userId}/absences`, { date });
      alert('User marked as absent for the selected date');
    } catch (error) {
      setError('Failed to mark user as absent');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="users-page">
      <h1>Team Members</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="users-grid">
        {users.map(user => (
          <div key={user._id} className="user-card">
            <div className="user-header">
              <h3>{user.name}</h3>
              <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="user-details">
              <p>Email: {user.email}</p>
              {user.phone && <p>Phone: {user.phone}</p>}
              <p>Assignments: {user.assignmentCount || 0}</p>
              {user.lastAssigned && (
                <p>Last assigned: {new Date(user.lastAssigned).toLocaleDateString()}</p>
              )}
            </div>

            {currentUser?.isAdmin && (
              <div className="user-actions">
                <button 
                  onClick={() => handleMarkAbsent(user._id, new Date().toISOString())}
                  className="btn btn-secondary"
                >
                  Mark Absent Today
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;