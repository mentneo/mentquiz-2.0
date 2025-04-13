import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupAdminUser, createTestTeacher } from '../../setupApp';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

function Setup() {
  const [adminLoading, setAdminLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const navigate = useNavigate();

  // Sign out any existing user when the setup page loads
  useEffect(() => {
    const ensureSignedOut = async () => {
      try {
        await signOut(auth);
        console.log("Signed out any existing users");
      } catch (err) {
        console.error("Error signing out:", err);
      }
    };
    
    ensureSignedOut();
  }, []);

  const handleSetupAdmin = async () => {
    setAdminLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Make sure user is signed out before creating new account
      console.log("Signing out before setup");
      await signOut(auth);
      
      // Add a small delay to ensure the signOut completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Creating admin user...");
      const result = await setupAdminUser();
      console.log("Admin creation result:", result);
      
      if (result.success) {
        setMessage(result.message || 'Admin account set up successfully! You can now login with admin@quiz.com / admin123');
        setSetupComplete(true);
      } else {
        setError('Failed to set up admin account: ' + (result.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Admin creation error:", err);
      setError('Error during setup: ' + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSetupTeacher = async () => {
    setTeacherLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Make sure user is signed out before creating new account
      console.log("Signing out before setup");
      await signOut(auth);
      
      // Add a small delay to ensure the signOut completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Creating teacher user...");
      const result = await createTestTeacher();
      console.log("Teacher creation result:", result);
      
      if (result.success) {
        setMessage(result.message || 'Teacher account set up successfully! You can now login with teacher@quiz.com / teacher123');
        setSetupComplete(true);
      } else {
        setError('Failed to set up teacher account: ' + (result.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Teacher creation error:", err);
      setError('Error during setup: ' + err.message);
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Quiz App Setup</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Success!</p>
            <p>{message}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Setting up the app</h3>
            <p className="mb-4 text-gray-600">
              Click the buttons below to create test accounts for your app. This will help you get started with testing the app's features.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleSetupAdmin}
              className="btn w-full bg-purple-600 hover:bg-purple-700"
              disabled={adminLoading || teacherLoading}
            >
              {adminLoading ? 'Setting up Admin Account...' : setupComplete ? 'Reset Admin Account' : 'Set up Admin Account'}
            </button>
            
            <button
              onClick={handleSetupTeacher}
              className="btn w-full bg-blue-600 hover:bg-blue-700"
              disabled={adminLoading || teacherLoading}
            >
              {teacherLoading ? 'Setting up Teacher Account...' : setupComplete ? 'Reset Teacher Account' : 'Set up Teacher Account'}
            </button>
            
            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/login')}
                className="btn bg-green-600 hover:bg-green-700"
              >
                Go to Login Page
              </button>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Login Credentials:</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p><strong>Admin:</strong> admin@quiz.com / admin123</p>
              <p><strong>Teacher:</strong> teacher@quiz.com / teacher123</p>
              <p><strong>Student:</strong> Use Google Sign-in</p>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-1"><strong>Note:</strong> If you're experiencing login issues:</p>
              <ol className="list-decimal list-inside">
                <li>Try using the setup buttons above to reset the accounts</li>
                <li>Make sure you've deployed Firestore security rules</li>
                <li>Check the browser console for specific errors</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup;
