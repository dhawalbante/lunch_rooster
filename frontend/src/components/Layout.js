// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import './Layout.css';

// function Layout({ children }) {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   const isActive = (path) => location.pathname === path;

//   return (
//     <div className="layout">
//       <nav className="navbar">
//         <div className="nav-brand">
//           <h2>आज पेपर कोन उठाएगा?</h2>
//         </div>
//         <div className="nav-links">
//           <Link to="/" className={isActive('/') ? 'active' : ''}>
//             Dashboard
//           </Link>
//           <Link to="/users" className={isActive('/users') ? 'active' : ''}>
//             Team
//           </Link>
//           <Link to="/history" className={isActive('/history') ? 'active' : ''}>
//             History
//           </Link>
//           {/* <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
//             Chat
//           </Link> */}
//           {user?.isAdmin && (
//             <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
//               Admin
//             </Link>
//           )}
//         </div>
//         <div className="nav-user">
//           <span>Hello, {user?.name}</span>
//           <button onClick={logout} className="btn btn-secondary">
//             Logout
//           </button>
//         </div>
//       </nav>
//       <main className="main-content">
//         {children}
//       </main>
//     </div>
//   );
// }

// export default Layout;






import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>आज पेपर कोन उठाएगा?</h2>
        </div>
        
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/users" className={isActive('/users') ? 'active' : ''}>
            Team
          </Link>
          <Link to="/history" className={isActive('/history') ? 'active' : ''}>
            History
          </Link>
          {/* Uncomment when ready to use */}
          <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
            Chat
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              Admin
            </Link>
          )}
        </div>
        
        <div className="nav-user">
          <span>Hello, {user?.name || 'User'}</span>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary"
            aria-label="Logout from current session"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;