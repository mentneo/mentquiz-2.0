import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        if (!currentUser) {
          console.log("No current user, redirecting to login");
          navigate('/login');
          return;
        }

        // Fetch student data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log("No user document found, redirecting to profile");
          navigate('/student/profile');
          return;
        }
        
        const userData = userDoc.data();
        
        // Check if profile is complete
        if (!userData.profileComplete) {
          console.log("Profile incomplete, redirecting to profile page");
          navigate('/student/profile');
          return;
        }
        
        setStudent(userData);
        
        // Get student grade
        const studentGrade = userData.grade;
        console.log("Student grade:", studentGrade);
        
        // Fetch quizzes for this grade
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('targetGrade', '==', studentGrade)
        );
        
        const quizzesSnapshot = await getDocs(quizzesQuery);
        
        if (quizzesSnapshot.empty) {
          console.log("No quizzes found for grade", studentGrade);
        } else {
          console.log(`Found ${quizzesSnapshot.size} quizzes for grade ${studentGrade}`);
        }
        
        // Fetch student's quiz attempts
        const attemptsQuery = query(
          collection(db, 'attempts'),
          where('studentId', '==', currentUser.uid)
        );
        
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attemptedQuizIds = attemptsSnapshot.docs.map(doc => doc.data().quizId);
        const attempts = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAttemptedQuizzes(attempts);
        
        // Process available quizzes
        const quizList = [];
        quizzesSnapshot.forEach(doc => {
          const quiz = { id: doc.id, ...doc.data() };
          if (!attemptedQuizIds.includes(doc.id)) {
            quizList.push(quiz);
          }
        });
        
        setAvailableQuizzes(quizList);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError('Error loading dashboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="text-center py-10">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      {student && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Grade:</strong> {student.grade}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
          
          {availableQuizzes.length === 0 ? (
            <p className="text-gray-500">No quizzes available for your grade right now.</p>
          ) : (
            <ul className="space-y-3">
              {availableQuizzes.map(quiz => (
                <li key={quiz.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">Time: {quiz.timeLimit} minutes</p>
                    </div>
                    <Link 
                      to={`/quiz/${quiz.id}`}
                      className="btn bg-green-600 hover:bg-green-700 text-sm"
                    >
                      Start Quiz
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Completed Quizzes</h2>
          
          {attemptedQuizzes.length === 0 ? (
            <p className="text-gray-500">You haven't completed any quizzes yet.</p>
          ) : (
            <ul className="space-y-3">
              {attemptedQuizzes.map(attempt => (
                <li key={attempt.id} className="border border-gray-200 rounded-md p-3">
                  <h3 className="font-medium">{attempt.quizTitle}</h3>
                  <p className="text-sm">
                    Score: <span className="font-bold">{attempt.score}/{attempt.totalQuestions}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Completed on: {new Date(attempt.submittedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
