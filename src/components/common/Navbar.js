import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // Handle logout
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  // Home path based on role
  const getHomePath = () => {
    if (!currentUser) return '/login';
    
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to={getHomePath()} className="font-bold text-2xl text-blue-600">
            Quiz App
          </Link>
          
          <div className="hidden md:block">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {userRole === 'admin' && (
                  <div className="space-x-3">
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                    <Link to="/admin/manage-teachers" className="text-gray-700 hover:text-blue-600">Teachers</Link>
                    <Link to="/admin/manage-students" className="text-gray-700 hover:text-blue-600">Students</Link>
                    <Link to="/admin/analytics" className="text-gray-700 hover:text-blue-600">Analytics</Link>
                  </div>
                )}
                
                {userRole === 'teacher' && (
                  <div className="space-x-3">
                    <Link to="/teacher/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                    <Link to="/teacher/create-quiz" className="text-gray-700 hover:text-blue-600">Create Quiz</Link>
                  </div>
                )}
                
                {userRole === 'student' && (
                  <div className="space-x-3">
                    <Link to="/student/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  </div>
                )}
                
                <div className="border-l border-gray-300 h-6 mx-2"></div>
                
                <div className="flex items-center">
                  <span className="text-gray-600 mr-3">{currentUser.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Link to="/login" className="btn">
                  Login
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMenu && (
          <div className="md:hidden pb-4">
            {currentUser ? (
              <div className="flex flex-col space-y-3">
                {userRole === 'admin' && (
                  <>
                    <Link 
                      to="/admin/dashboard" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin/manage-teachers" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Teachers
                    </Link>
                    <Link 
                      to="/admin/manage-students" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Students
                    </Link>
                    <Link 
                      to="/admin/analytics" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Analytics
                    </Link>
                  </>
                )}
                
                {userRole === 'teacher' && (
                  <>
                    <Link 
                      to="/teacher/dashboard" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/teacher/create-quiz" 
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setShowMenu(false)}
                    >
                      Create Quiz
                    </Link>
                  </>
                )}
                
                {userRole === 'student' && (
                  <Link 
                    to="/student/dashboard" 
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </Link>
                )}
                
                <div className="border-t border-gray-300 my-2 pt-2">
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout ({currentUser.email})
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setShowMenu(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
