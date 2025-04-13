import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// This function will help you create an admin user when you first run the app
export async function setupAdminUser() {
  const adminEmail = 'admin@quiz.com';
  const adminPassword = 'admin123';
  
  try {
    // Clean approach - always try to create a new user
    try {
      console.log("Creating new admin user");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );
      
      // Create user document with admin role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: adminEmail,
        role: 'admin',
        name: 'Admin User',
        createdAt: new Date().toISOString()
      });
      
      console.log('Admin user created successfully.');
      return { success: true, message: 'Admin user created successfully.' };
    } catch (createError) {
      // If user already exists, try to sign in and update document
      if (createError.code === 'auth/email-already-in-use') {
        console.log("Admin user exists, updating document");
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          
          // Update/ensure the user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: adminEmail,
            role: 'admin',
            name: 'Admin User',
            createdAt: new Date().toISOString()
          }, { merge: true });
          
          return { 
            success: true, 
            message: 'Admin user already exists. Document updated.' 
          };
        } catch (signInError) {
          return {
            success: false,
            error: { message: 'Admin email exists but password may be incorrect. Try a different email.' }
          };
        }
      }
      
      throw createError;
    }
  } catch (error) {
    console.error('Failed to create/update admin user:', error);
    return { success: false, error };
  }
}

// This function will create a test teacher account
export async function createTestTeacher() {
  const teacherEmail = 'teacher@quiz.com';
  const teacherPassword = 'teacher123';
  
  try {
    // Clean approach - always try to create a new user
    try {
      console.log("Creating new teacher user");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        teacherEmail,
        teacherPassword
      );
      
      // Create user document with teacher role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: teacherEmail,
        role: 'teacher',
        name: 'Test Teacher',
        createdAt: new Date().toISOString()
      });
      
      console.log('Teacher user created successfully.');
      return { success: true, message: 'Teacher user created successfully.' };
    } catch (createError) {
      // If user already exists, try to sign in and update document
      if (createError.code === 'auth/email-already-in-use') {
        console.log("Teacher user exists, updating document");
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, teacherEmail, teacherPassword);
          
          // Update/ensure the user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: teacherEmail,
            role: 'teacher',
            name: 'Test Teacher',
            createdAt: new Date().toISOString()
          }, { merge: true });
          
          return { 
            success: true, 
            message: 'Teacher user already exists. Document updated.' 
          };
        } catch (signInError) {
          return {
            success: false,
            error: { message: 'Teacher email exists but password may be incorrect. Try a different email.' }
          };
        }
      }
      
      throw createError;
    }
  } catch (error) {
    console.error('Failed to create/update teacher user:', error);
    return { success: false, error };
  }
}
