import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function signup(email, password, role) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with role
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  function login(email, password) {
    console.log("Attempting login with email:", email);
    return signInWithEmailAndPassword(auth, email, password)
      .then(result => {
        console.log("Login successful for:", result.user.email);
        return result;
      })
      .catch(error => {
        console.error("Login error:", error.code, error.message);
        throw error;
      });
  }

  async function loginWithGoogle() {
    try {
      console.log("Starting Google sign-in process");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful");
      
      // Assume student role for Google sign-ins
      setUserRole('student');
      
      return result;
    } catch (error) {
      console.error("Error in loginWithGoogle:", error);
      throw error;
    }
  }

  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  async function getUserRole(uid) {
    try {
      console.log("Getting user role for:", uid);
      
      // First, check the provider - if Google, default to student
      const isGoogleUser = auth.currentUser?.providerData?.[0]?.providerId === 'google.com';
      
      // Always try to get the user document
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          console.log("User role found in document:", role);
          setUserRole(role);
          return role;
        } else {
          console.log("No user document found");
          
          // If Google user with no document, assume student
          if (isGoogleUser) {
            console.log("Google user with no document - assuming student role");
            setUserRole('student');
            return 'student';
          }
          
          return null;
        }
      } catch (docError) {
        console.error("Error getting user document:", docError);
        
        // If there's a permissions error and it's a Google user, assume student
        if (isGoogleUser) {
          console.log("Error getting document for Google user - assuming student role");
          setUserRole('student');
          return 'student';
        }
        
        throw docError;
      }
    } catch (error) {
      console.error("Error in getUserRole:", error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        // Determine if this is a Google Sign-in
        const isGoogleUser = user.providerData?.[0]?.providerId === 'google.com';
        
        if (isGoogleUser) {
          console.log("Setting initial student role for Google user");
          setUserRole('student');
        }
        
        try {
          await getUserRole(user.uid);
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          setError(error.message);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    loginWithGoogle,
    getUserRole,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
