import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function StudentProfile() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) {
        console.log("No current user found");
        setInitialLoading(false);
        return;
      }
      
      try {
        console.log("Fetching student profile for:", currentUser.uid);
        
        // Verify if user document exists and create it if it doesn't
        const userDocRef = doc(db, 'users', currentUser.uid);
        let userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log("No user document found, creating one");
          // Create initial user document
          const userData = {
            email: currentUser.email,
            role: 'student',
            name: currentUser.displayName || '',
            createdAt: new Date().toISOString(),
            profileComplete: false
          };
          
          await setDoc(userDocRef, userData);
          
          // Get the document we just created
          userDoc = { data: () => userData };
        }
        
        const userData = userDoc.data();
        console.log("User data:", userData);
        
        // Populate form with existing data
        setName(userData.name || currentUser.displayName || '');
        setGrade(userData.grade || '');
        
        // If profile is already complete, redirect to dashboard
        if (userData.profileComplete) {
          console.log("Profile already complete, redirecting to dashboard");
          navigate('/student/dashboard');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError('Failed to load profile: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    }
    
    fetchProfile();
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
      setError('No authenticated user found. Please log in again.');
      return;
    }
    
    if (!name.trim()) {
      return setError('Name is required');
    }
    
    if (!grade.trim()) {
      return setError('Class/Grade is required');
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log("Updating student profile:", { name, grade });
      
      // Update the user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name,
        grade,
        profileComplete: true,
        updatedAt: new Date().toISOString()
      });
      
      console.log("Profile updated successfully, redirecting to dashboard");
      navigate('/student/dashboard');
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">Full Name</label>
            <input 
              id="name" 
              type="text" 
              className="input" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div>
            <label htmlFor="grade" className="block mb-1">Class/Grade</label>
            <select 
              id="grade" 
              className="input" 
              required 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select Class/Grade</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn w-full bg-green-600 hover:bg-green-700" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentProfile;
