import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalAttempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Count teachers
        const teachersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'teacher')
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teacherCount = teachersSnapshot.size;
        
        // Count students
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentCount = studentsSnapshot.size;
        
        // Count quizzes
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        const quizCount = quizzesSnapshot.size;
        
        // Count attempts
        const attemptsSnapshot = await getDocs(collection(db, 'attempts'));
        const attemptCount = attemptsSnapshot.size;
        
        setStats({
          totalTeachers: teacherCount,
          totalStudents: studentCount,
          totalQuizzes: quizCount,
          totalAttempts: attemptCount
        });
      } catch (err) {
        setError('Error loading dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Link to="/admin/manage-teachers" className="card bg-blue-50 border border-blue-100 hover:bg-blue-100 transition">
          <h2 className="text-lg font-medium mb-2 text-blue-800">Teachers</h2>
          <p className="text-3xl font-bold">{stats.totalTeachers}</p>
        </Link>
        
        <Link to="/admin/manage-students" className="card bg-green-50 border border-green-100 hover:bg-green-100 transition">
          <h2 className="text-lg font-medium mb-2 text-green-800">Students</h2>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </Link>
        
        <div className="card bg-purple-50 border border-purple-100">
          <h2 className="text-lg font-medium mb-2 text-purple-800">Quizzes</h2>
          <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
        </div>
        
        <Link to="/admin/analytics" className="card bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 transition">
          <h2 className="text-lg font-medium mb-2 text-yellow-800">Quiz Attempts</h2>
          <p className="text-3xl font-bold">{stats.totalAttempts}</p>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Teachers</h2>
            <Link to="/admin/manage-teachers" className="text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <p className="text-gray-600 mb-4">
            Create and manage teacher accounts. View teacher activity and quiz creation statistics.
          </p>
          <Link to="/admin/manage-teachers" className="btn bg-blue-600 hover:bg-blue-700 inline-block">
            Manage Teachers
          </Link>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Students</h2>
            <Link to="/admin/manage-students" className="text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <p className="text-gray-600 mb-4">
            View student accounts, grades, and quiz performances. Analyze student activities.
          </p>
          <Link to="/admin/manage-students" className="btn bg-green-600 hover:bg-green-700 inline-block">
            Manage Students
          </Link>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <p className="text-gray-600 mb-4">
            Review quiz participation, performance metrics, and overall system analytics.
          </p>
          <Link to="/admin/analytics" className="btn bg-purple-600 hover:bg-purple-700 inline-block">
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
