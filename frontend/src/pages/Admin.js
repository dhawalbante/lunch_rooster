import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isAdmin: false
  });
  const [newHoliday, setNewHoliday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [draggedUser, setDraggedUser] = useState(null);
  const [resettingRotation, setResettingRotation] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchHolidays();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      // Sort by sequence
      const sortedUsers = response.data.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      setUsers(sortedUsers);
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/api/admin/holidays');
      setHolidays(response.data);
    } catch (error) {
      console.error('Failed to load holidays:', error);
    }
  };

  // Client-side validation for user form inputs
  const validateUser = () => {
    const errors = {};
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Invalid email format';
    }
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    const errors = validateUser();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      await api.post('/api/admin/users', newUser);
      setShowAddUser(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        isAdmin: false
      });
      fetchUsers();
    } catch (error) {
      console.error('Add user error:', error.response || error);
      if (error.response?.data?.errors) {
        // backend validation errors array
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.param) backendErrors[err.param] = err.msg;
        });
        setValidationErrors(backendErrors);
      } else {
        const serverMsg = error.response?.data?.message || (error.response?.data && JSON.stringify(error.response.data)) || error.message || 'Failed to add user';
        setError(serverMsg);
      }
    }
  };

  const handleToggleActive = async (userId, active) => {
    try {
      await api.put(`/api/admin/users/${userId}`, { active });
      fetchUsers();
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setError('');

    if (!newHoliday) {
      setError('Please select a date');
      return;
    }

    try {
      await api.post('/api/admin/holidays', { date: newHoliday });
      setNewHoliday('');
      setShowAddHoliday(false);
      fetchHolidays();
    } catch (error) {
      const serverMsg = error.response?.data?.message || 'Failed to add holiday';
      setError(serverMsg);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (window.confirm('Are you sure you want to remove this holiday?')) {
      try {
        await api.delete(`/api/admin/holidays/${holidayId}`);
        fetchHolidays();
      } catch (error) {
        setError('Failed to delete holiday');
      }
    }
  };

  const handleDragStart = (user) => {
    setDraggedUser(user);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetUser) => {
    if (!draggedUser || draggedUser._id === targetUser._id) {
      setDraggedUser(null);
      return;
    }

    try {
      // Update sequences
      const draggedIndex = users.findIndex(u => u._id === draggedUser._id);
      const targetIndex = users.findIndex(u => u._id === targetUser._id);

      const newUsers = [...users];
      newUsers.splice(draggedIndex, 1);
      newUsers.splice(targetIndex, 0, draggedUser);

      // Update sequence numbers
      const updates = newUsers.map((user, index) => ({
        userId: user._id,
        sequence: index
      }));

      // Send updates to backend
      await api.post('/api/admin/users/update-sequence', { updates });
      
      // Refresh users
      fetchUsers();
    } catch (error) {
      setError('Failed to update user sequence');
    } finally {
      setDraggedUser(null);
    }
  };

  const handleResetRotation = async () => {
    if (window.confirm('Are you sure you want to reset all future assignments and rotation history? This cannot be undone.')) {
      try {
        setResettingRotation(true);
        const response = await api.post('/api/admin/reset-rotation');
        setError('');
        alert(`Rotation reset successfully. Deleted ${response.data.deletedAssignments} future assignments.`);
        // Optionally refresh data
        fetchUsers();
        fetchHolidays();
      } catch (error) {
        setError('Failed to reset rotation history');
      } finally {
        setResettingRotation(false);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <button 
          onClick={() => setShowAddUser(true)}
          className="btn btn-primary"
        >
          Add New User
        </button>
        <button 
          onClick={() => setShowAddHoliday(true)}
          className="btn btn-primary"
        >
          Add Holiday
        </button>
        <button 
          onClick={handleResetRotation}
          disabled={resettingRotation}
          className="btn btn-danger"
          title="Reset all future assignments and rotation history"
        >
          {resettingRotation ? 'Resetting...' : 'Reset Rotation History'}
        </button>
      </div>

      {showAddUser && (
        <div className="add-user-modal">
          <form onSubmit={handleAddUser}>
            <h3>Add New User</h3>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              required
            />
            {validationErrors.name && <div className="validation-error">{validationErrors.name}</div>}
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              required
            />
            {validationErrors.email && <div className="validation-error">{validationErrors.email}</div>}
            <input
              type="text"
              placeholder="Phone (optional)"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
            />
            {validationErrors.password && <div className="validation-error">{validationErrors.password}</div>}
            <label>
              <input
                type="checkbox"
                checked={newUser.isAdmin}
                onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
              />
              Admin User
            </label>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Add User</button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddUser(false);
                  setValidationErrors({});
                  setError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddHoliday && (
        <div className="add-user-modal">
          <form onSubmit={handleAddHoliday}>
            <h3>Add Holiday</h3>
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              required
            />
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Add Holiday</button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddHoliday(false);
                  setNewHoliday('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="holidays-table">
        <h2>Holidays</h2>
        {holidays.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(holiday => (
                <tr key={holiday._id}>
                  <td>{new Date(holiday.date).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleDeleteHoliday(holiday._id)}
                      className="btn btn-small btn-danger"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No holidays added yet</p>
        )}
      </div>

      <div className="users-table">
        <h2>All Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Role</th>
              <th>Assignments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr 
                key={user._id}
                draggable
                onDragStart={() => handleDragStart(user)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(user)}
                style={{
                  cursor: 'move',
                  opacity: draggedUser?._id === user._id ? 0.5 : 1,
                  backgroundColor: draggedUser?._id === user._id ? '#f0f0f0' : 'transparent'
                }}
              >
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                <td>{user.assignmentCount || 0}</td>
                <td className="actions">
                  <button 
                    onClick={() => handleToggleActive(user._id, !user.active)}
                    className="btn btn-small"
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user._id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
