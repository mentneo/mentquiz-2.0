import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    gradeDistribution: [],
    recentQuizzes: [],
    topStudents: []
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Get all quizzes
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzes = quizzesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const totalQuizzes = quizzes.length;
        
        // Sort quizzes by created date manually
        const recentQuizzes = [...quizzes]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA; // Sort in descending order
          })
          .slice(0, 5); // Get first 5
        
        // Get all quiz attempts
        const attemptsSnapshot = await getDocs(collection(db, 'attempts'));
        const attemptsList = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const totalAttempts = attemptsList.length;
        
        // Calculate average score across all attempts
        let totalScore = 0;
        let totalQuestions = 0;
        
        attemptsList.forEach(attempt => {
          totalScore += attempt.score || 0;
          totalQuestions += attempt.totalQuestions || 0;
        });
        
        const averageScore = totalQuestions > 0 
          ? Math.round((totalScore / totalQuestions) * 100) 
          : 0;
        
        // Grade distribution
        const grades = ['6', '7', '8', '9', '10', '11', '12'];
        const gradeDistribution = await Promise.all(grades.map(async (grade) => {
          // Count students in this grade - avoid using compound queries
          const studentsSnapshot = await getDocs(collection(db, 'users'));
          const studentsInGrade = studentsSnapshot.docs.filter(
            doc => doc.data().role === 'student' && doc.data().grade === grade
          );
          const studentCount = studentsInGrade.length;
          
          // Count quizzes targeted at this grade - filter locally
          const quizzesForGrade = quizzes.filter(quiz => quiz.targetGrade === grade);
          const quizCount = quizzesForGrade.length;
          
          // Count attempts by students in this grade
          const attemptsForGrade = attemptsList.filter(a => a.studentGrade === grade);
          
          return {
            grade,
            studentCount,
            quizCount,
            attemptCount: attemptsForGrade.length
          };
        }));
        
        // Top students by average score
        const studentPerformance = {};
        
        for (const attempt of attemptsList) {
          const studentId = attempt.studentId;
          if (!studentId) continue; // Skip if no student ID
          
          const score = attempt.score || 0;
          const totalQuestions = attempt.totalQuestions || 0;
          
          if (!studentPerformance[studentId]) {
            studentPerformance[studentId] = {
              totalScore: 0,
              totalQuestions: 0,
              attemptCount: 0,
              studentName: attempt.studentName || 'Unknown Student',
              studentGrade: attempt.studentGrade || 'N/A'
            };
          }
          
          studentPerformance[studentId].totalScore += score;
          studentPerformance[studentId].totalQuestions += totalQuestions;
          studentPerformance[studentId].attemptCount += 1;
        }
        
        // Convert to array and calculate average scores
        const studentsArray = Object.entries(studentPerformance).map(([id, data]) => ({
          id,
          name: data.studentName,
          grade: data.studentGrade,
          averageScore: data.totalQuestions > 0 
            ? Math.round((data.totalScore / data.totalQuestions) * 100) 
            : 0,
          attemptCount: data.attemptCount
        }));
        
        // Sort by average score and get top 5
        const topStudents = studentsArray
          .sort((a, b) => b.averageScore - a.averageScore)
          .filter(s => s.attemptCount >= 2) // At least 2 attempts
          .slice(0, 5);
        
        setAnalytics({
          totalQuizzes,
          totalAttempts,
          averageScore,
          gradeDistribution,
          recentQuizzes,
          topStudents
        });
      } catch (err) {
        console.error("Analytics error:", err);
        setError('Error loading analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Quiz Analytics</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-blue-50 border border-blue-100">
          <h3 className="text-lg font-medium mb-2 text-blue-800">Total Quizzes</h3>
          <p className="text-3xl font-bold">{analytics.totalQuizzes}</p>
        </div>
        
        <div className="card bg-green-50 border border-green-100">
          <h3 className="text-lg font-medium mb-2 text-green-800">Total Attempts</h3>
          <p className="text-3xl font-bold">{analytics.totalAttempts}</p>
        </div>
        
        <div className="card bg-purple-50 border border-purple-100">
          <h3 className="text-lg font-medium mb-2 text-purple-800">Average Score</h3>
          <p className="text-3xl font-bold">{analytics.averageScore}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Grade</th>
                  <th className="text-left py-2">Students</th>
                  <th className="text-left py-2">Quizzes</th>
                  <th className="text-left py-2">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {analytics.gradeDistribution.map(grade => (
                  <tr key={grade.grade}>
                    <td className="py-2">Grade {grade.grade}</td>
                    <td className="py-2">{grade.studentCount}</td>
                    <td className="py-2">{grade.quizCount}</td>
                    <td className="py-2">{grade.attemptCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Performing Students</h2>
          
          {analytics.topStudents.length === 0 ? (
            <p className="text-gray-500">Not enough data to display top students yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Rank</th>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Grade</th>
                    <th className="text-left py-2">Avg. Score</th>
                    <th className="text-left py-2">Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{student.name}</td>
                      <td className="py-2">Grade {student.grade}</td>
                      <td className="py-2 font-medium">{student.averageScore}%</td>
                      <td className="py-2">{student.attemptCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recently Created Quizzes</h2>
        
        {analytics.recentQuizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes have been created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Target Grade</th>
                  <th className="text-left py-2">Questions</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentQuizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td className="py-2 font-medium">{quiz.title}</td>
                    <td className="py-2">Grade {quiz.targetGrade}</td>
                    <td className="py-2">{quiz.questions.length}</td>
                    <td className="py-2 text-sm text-gray-500">
                      {new Date(quiz.createdAt).toLocaleDateString()}
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

export default Analytics;
