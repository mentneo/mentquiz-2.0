import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      console.log("Attempting teacher login with:", email);
      
      // Sign in with email and password
      const userCredential = await login(email, password);
      console.log("Login successful, user:", userCredential.user.uid);
      
      // Check if user is a teacher
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.error("User document doesn't exist");
          setError('User account exists but has no role. Please contact an administrator.');
          return;
        }
        
        const userData = userDoc.data();
        console.log("User document exists:", userData);
        
        if (userData.role === 'teacher') {
          console.log("Confirmed teacher role, redirecting to dashboard");
          navigate('/teacher/dashboard');
        } else {
          console.log("User is not a teacher:", userData.role);
          setError(`This account is registered as a ${userData.role}, not a teacher`);
        }
      } catch (docErr) {
        console.error("Error checking user role:", docErr);
        setError('Error verifying teacher account. Please contact an administrator.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Failed to sign in: ' + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Teacher Login</h2>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input 
              id="email" 
              type="email" 
              className="input" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-1">Password</label>
            <input 
              id="password" 
              type="password" 
              className="input" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p>Need help? Contact the administrator or check the <Link to="/setup" className="text-blue-600 hover:underline">setup page</Link>.</p>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;
