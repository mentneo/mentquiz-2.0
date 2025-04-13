import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

function QuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch quiz data
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        
        if (!quizDoc.exists()) {
          setError('Quiz not found');
          return;
        }
        
        const quizData = quizDoc.data();
        
        // Verify that this teacher owns the quiz
        if (quizData.teacherId !== currentUser.uid) {
          setError('You do not have permission to view these results');
          return;
        }
        
        setQuiz(quizData);
        
        // Fetch all attempts for this quiz
        const attemptsQuery = query(
          collection(db, 'attempts'),
          where('quizId', '==', quizId)
        );
        
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attemptsList = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAttempts(attemptsList);
        
        // Calculate statistics
        if (attemptsList.length > 0) {
          const scores = attemptsList.map(a => a.score);
          const totalScore = scores.reduce((acc, score) => acc + score, 0);
          
          setStats({
            totalAttempts: attemptsList.length,
            averageScore: (totalScore / attemptsList.length).toFixed(2),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
          });
        }
      } catch (err) {
        setError('Error loading quiz results: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [quizId, currentUser]);

  if (loading) {
    return <div className="text-center py-10">Loading quiz results...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/teacher/dashboard')} 
          className="btn"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Results: {quiz?.title}</h1>
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="btn"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-blue-50 border border-blue-100">
          <h3 className="text-lg font-medium mb-2 text-blue-800">Total Attempts</h3>
          <p className="text-3xl font-bold">{stats.totalAttempts}</p>
        </div>
        
        <div className="card bg-green-50 border border-green-100">
          <h3 className="text-lg font-medium mb-2 text-green-800">Average Score</h3>
          <p className="text-3xl font-bold">{stats.averageScore} / {quiz?.questions.length}</p>
        </div>
        
        <div className="card bg-purple-50 border border-purple-100">
          <h3 className="text-lg font-medium mb-2 text-purple-800">Highest Score</h3>
          <p className="text-3xl font-bold">{stats.highestScore} / {quiz?.questions.length}</p>
        </div>
        
        <div className="card bg-yellow-50 border border-yellow-100">
          <h3 className="text-lg font-medium mb-2 text-yellow-800">Lowest Score</h3>
          <p className="text-3xl font-bold">{stats.lowestScore} / {quiz?.questions.length}</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Student Attempts</h2>
        
        {attempts.length === 0 ? (
          <p className="text-gray-500">No students have attempted this quiz yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{attempt.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Grade {attempt.studentGrade}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {attempt.score} / {attempt.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString()}
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

export default QuizResults;
