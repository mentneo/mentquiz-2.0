import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FcGoogle } from 'react-icons/fc';

function StudentLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      
      // First login with Google
      const result = await loginWithGoogle();
      console.log("Google login successful, user:", result.user.uid);
      
      try {
        // Create or verify the user document in Firestore
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create new student document
          console.log("Creating new student document");
          await setDoc(userDocRef, {
            email: result.user.email,
            role: 'student',
            name: result.user.displayName || '',
            createdAt: new Date().toISOString(),
            profileComplete: false
          });
          
          // Redirect to profile completion page
          navigate('/student/profile');
        } else {
          // User document exists
          const userData = userDoc.data();
          console.log("User document exists:", userData);
          
          if (userData.profileComplete) {
            // If profile is already complete, go to dashboard
            navigate('/student/dashboard');
          } else {
            // If profile is incomplete, go to profile page
            navigate('/student/profile');
          }
        }
      } catch (docError) {
        console.error("Error with user document:", docError);
        setError('Error accessing user data: ' + docError.message);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError('Failed to sign in with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Student Login</h2>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>}
        
        <button 
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          <FcGoogle className="text-xl mr-2" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        <p className="mt-4 text-sm text-center text-gray-600">
          Students can only login with Google.
          <br/>
          You'll be prompted to complete your profile after login.
        </p>
      </div>
    </div>
  );
}

export default StudentLogin;
