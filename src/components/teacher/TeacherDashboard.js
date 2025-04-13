import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function TeacherDashboard() {
  const { currentUser } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch teacher data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setTeacher(userDoc.data());
        }
        
        // Fetch quizzes created by this teacher
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('teacherId', '==', currentUser.uid)
        );
        
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizList = [];
        
        // For each quiz, get attempt statistics
        for (const quizDoc of quizzesSnapshot.docs) {
          const quiz = { id: quizDoc.id, ...quizDoc.data() };
          
          // Get attempts for this quiz
          const attemptsQuery = query(
            collection(db, 'attempts'),
            where('quizId', '==', quizDoc.id)
          );
          
          const attemptsSnapshot = await getDocs(attemptsQuery);
          quiz.attemptCount = attemptsSnapshot.size;
          
          if (attemptsSnapshot.size > 0) {
            let totalScore = 0;
            attemptsSnapshot.forEach(doc => {
              totalScore += doc.data().score;
            });
            quiz.averageScore = (totalScore / attemptsSnapshot.size).toFixed(1);
          } else {
            quiz.averageScore = "N/A";
          }
          
          quizList.push(quiz);
        }
        
        setQuizzes(quizList);
      } catch (err) {
        setError('Error loading dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-10">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <Link to="/teacher/create-quiz" className="btn bg-blue-600 hover:bg-blue-700">
          Create New Quiz
        </Link>
      </div>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      {teacher && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p><strong>Name:</strong> {teacher.name || currentUser.email}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </div>
      )}
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Quizzes</h2>
        
        {quizzes.length === 0 ? (
          <p className="text-gray-500">You haven't created any quizzes yet. Click "Create New Quiz" to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map(quiz => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{quiz.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Grade {quiz.targetGrade}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quiz.questions.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quiz.attemptCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quiz.averageScore}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/teacher/quiz-results/${quiz.id}`} className="text-blue-600 hover:text-blue-800">
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
