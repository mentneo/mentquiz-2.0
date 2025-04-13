import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

function AttemptQuiz() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        
        if (quizDoc.exists()) {
          setQuiz(quizDoc.data());
          setTimeLeft(quizDoc.data().timeLimit * 60); // Convert minutes to seconds
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        setError('Error loading quiz: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuiz();
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Timer display formatter
  const formatTime = () => {
    if (!timeLeft) return '00:00';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (Object.keys(answers).length === 0) {
        alert('You have not answered any questions!');
        return;
      }
      
      // Calculate the score
      let score = 0;
      let totalQuestions = quiz.questions.length;
      
      for (const question of quiz.questions) {
        const selectedAnswer = answers[question.id];
        if (selectedAnswer && selectedAnswer === question.correctAnswerId) {
          score++;
        }
      }
      
      // Get student info
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const student = userDoc.data();
      
      // Create attempt record
      await addDoc(collection(db, 'attempts'), {
        studentId: currentUser.uid,
        studentName: student.name,
        studentGrade: student.grade,
        quizId: quizId,
        quizTitle: quiz.title,
        score: score,
        totalQuestions: totalQuestions,
        answers: answers,
        submittedAt: new Date().toISOString()
      });
      
      alert(`Quiz submitted successfully! Your score: ${score}/${totalQuestions}`);
      navigate('/student/dashboard');
    } catch (err) {
      setError('Error submitting quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/student/dashboard')} 
          className="btn"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{quiz?.title}</h1>
        <div className="text-xl font-mono bg-gray-200 py-1 px-3 rounded-md">
          Time Left: {formatTime()}
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">{quiz?.description}</p>
      
      <div className="space-y-8">
        {quiz?.questions.map((question, index) => (
          <div key={question.id} className="card">
            <h3 className="text-xl font-medium mb-4">
              {index + 1}. {question.text}
            </h3>
            
            <div className="space-y-3">
              {question.answers.map(answer => (
                <div key={answer.id} className="flex items-center">
                  <input 
                    type="radio" 
                    id={`q${question.id}_a${answer.id}`}
                    name={`question_${question.id}`}
                    value={answer.id}
                    checked={answers[question.id] === answer.id}
                    onChange={() => handleAnswerChange(question.id, answer.id)}
                    className="mr-3"
                  />
                  <label htmlFor={`q${question.id}_a${answer.id}`}>
                    {answer.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="btn bg-green-600 hover:bg-green-700 px-6"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}

export default AttemptQuiz;
