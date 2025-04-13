import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  deleteUser, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // New teacher form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Get teachers
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const teachersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'teacher')
        );
        
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersList = [];
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          
          // Count quizzes created by this teacher
          const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('teacherId', '==', teacherDoc.id)
          );
          
          const quizzesSnapshot = await getDocs(quizzesQuery);
          
          teachersList.push({
            id: teacherDoc.id,
            ...teacherData,
            quizCount: quizzesSnapshot.size
          });
        }
        
        setTeachers(teachersList);
      } catch (err) {
        setError('Error loading teachers: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTeachers();
  }, []);

  // Add new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setAddError('');
    
    if (!newEmail || !newPassword || !newName) {
      setAddError('All fields are required');
      return;
    }
    
    try {
      setAddLoading(true);
      
      // First sign out current user (admin)
      await signOut(auth);
      
      // Create the teacher account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );
      
      const teacherId = userCredential.user.uid;
      
      // Create user document with teacher role
      await setDoc(doc(db, 'users', teacherId), {
        email: newEmail,
        name: newName,
        role: 'teacher',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      });
      
      // Sign back in as admin
      try {
        await signInWithEmailAndPassword(auth, "admin@quiz.com", "admin123");
      } catch (signInError) {
        console.error("Failed to sign back in as admin:", signInError);
      }
      
      // Add to the local state
      setTeachers([
        ...teachers, 
        {
          id: teacherId,
          email: newEmail,
          name: newName,
          role: 'teacher',
          createdAt: new Date().toISOString(),
          quizCount: 0
        }
      ]);
      
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      
      alert('Teacher account created successfully!');
      
    } catch (err) {
      setAddError('Error adding teacher: ' + err.message);
      
      // Try to sign back in as admin if there was an error
      try {
        await signInWithEmailAndPassword(auth, "admin@quiz.com", "admin123");
      } catch (signInError) {
        console.error("Failed to sign back in as admin:", signInError);
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Delete teacher - update to also delete auth account
  const handleDeleteTeacher = async (teacherId, teacherEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherEmail}?`)) {
      return;
    }
    
    try {
      // Delete teacher document from Firestore
      await deleteDoc(doc(db, 'users', teacherId));
      
      // Note: Deleting the authentication account would require an admin SDK
      // or the user to be signed in. For security reasons, we can only delete
      // the Firestore document here.
      
      // Remove from the local state
      setTeachers(teachers.filter(t => t.id !== teacherId));
      
      alert('Teacher deleted successfully.');
    } catch (err) {
      alert('Error deleting teacher: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading teachers...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn bg-blue-600 hover:bg-blue-700"
        >
          Add Teacher
        </button>
      </div>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Teachers List</h2>
        
        {teachers.length === 0 ? (
          <p className="text-gray-500">No teachers found. Add your first teacher to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.name || 'No Name'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.quizCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleDeleteTeacher(teacher.id, teacher.email)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Teacher</h2>
            
            {addError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{addError}</p>
            </div>}
            
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label htmlFor="newEmail" className="block mb-1">Email</label>
                <input 
                  id="newEmail" 
                  type="email" 
                  className="input" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newName" className="block mb-1">Full Name</label>
                <input 
                  id="newName" 
                  type="text" 
                  className="input" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block mb-1">Password</label>
                <input 
                  id="newPassword" 
                  type="password" 
                  className="input" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The teacher will use these credentials to log in.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn bg-gray-300 text-black hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit" 
                  className="btn bg-blue-600 hover:bg-blue-700" 
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTeachers;
