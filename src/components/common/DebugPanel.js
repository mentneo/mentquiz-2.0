import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

function DebugPanel() {
  const { currentUser, userRole, error } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 bg-gray-900 text-white p-2 text-xs max-w-xs z-50 opacity-80">
      <h4 className="font-bold">Debug Info</h4>
      <p>User: {currentUser?.uid || 'Not logged in'}</p>
      <p>Email: {currentUser?.email || 'N/A'}</p>
      <p>Role: {userRole || 'Not set'}</p>
      <p>Provider: {currentUser?.providerData?.[0]?.providerId || 'N/A'}</p>
      {error && <p className="text-red-400">Error: {error}</p>}
    </div>
  );
}

export default DebugPanel;
