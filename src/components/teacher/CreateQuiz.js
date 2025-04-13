import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function CreateQuiz() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      text: '',
      answers: [
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' }
      ],
      correctAnswerId: ''
    }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add a new question to the quiz
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        text: '',
        answers: [
          { id: uuidv4(), text: '' },
          { id: uuidv4(), text: '' },
          { id: uuidv4(), text: '' },
          { id: uuidv4(), text: '' }
        ],
        correctAnswerId: ''
      }
    ]);
  };

  // Remove a question from the quiz
  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    } else {
      alert('Quiz must have at least one question');
    }
  };

  // Update question text
  const handleQuestionChange = (questionId, text) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, text };
      }
      return q;
    }));
  };

  // Update an answer option
  const handleAnswerChange = (questionId, answerId, text) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => {
            if (a.id === answerId) {
              return { ...a, text };
            }
            return a;
          })
        };
      }
      return q;
    }));
  };

  // Set the correct answer for a question
  const handleCorrectAnswerChange = (questionId, answerId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, correctAnswerId: answerId };
      }
      return q;
    }));
  };

  // Form validation
  const validateForm = () => {
    // Check basic fields
    if (!title.trim()) return 'Quiz title is required';
    if (!targetGrade) return 'Target grade is required';
    if (!timeLimit || timeLimit < 1) return 'Time limit must be at least 1 minute';
    
    // Validate questions and answers
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.text.trim()) {
        return `Question ${i+1} text is required`;
      }
      
      if (!q.correctAnswerId) {
        return `Question ${i+1} needs a correct answer selected`;
      }
      
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].text.trim()) {
          return `Answer ${j+1} for question ${i+1} is required`;
        }
      }
    }
    
    return null;
  };

  // Submit the quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        targetGrade,
        timeLimit: parseInt(timeLimit),
        questions,
        teacherId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      alert('Quiz created successfully!');
      navigate('/teacher/dashboard');
    } catch (err) {
      setError('Failed to create quiz: ' + err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      <form onSubmit={handleSubmit}>
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block mb-1">Quiz Title</label>
              <input 
                id="title" 
                type="text" 
                className="input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block mb-1">Description (Optional)</label>
              <textarea 
                id="description" 
                className="input h-24" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetGrade" className="block mb-1">Target Grade</label>
                <select 
                  id="targetGrade" 
                  className="input" 
                  value={targetGrade} 
                  onChange={(e) => setTargetGrade(e.target.value)}
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeLimit" className="block mb-1">Time Limit (minutes)</label>
                <input 
                  id="timeLimit" 
                  type="number" 
                  min="1" 
                  max="120" 
                  className="input" 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        
        {questions.map((question, index) => (
          <div key={question.id} className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Question {index + 1}</h3>
              
              <button 
                type="button" 
                onClick={() => removeQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor={`q-${question.id}`} className="block mb-1">Question Text</label>
              <input 
                id={`q-${question.id}`}
                type="text"
                className="input"
                value={question.text}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <p className="mb-2">Answer Options:</p>
              
              {question.answers.map((answer, aIndex) => (
                <div key={answer.id} className="flex items-center mb-3">
                  <input 
                    type="radio" 
                    id={`q${question.id}-a${answer.id}`}
                    name={`correct-${question.id}`}
                    checked={question.correctAnswerId === answer.id}
                    onChange={() => handleCorrectAnswerChange(question.id, answer.id)}
                    className="mr-2"
                    required
                  />
                  <input 
                    type="text"
                    className="input"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(question.id, answer.id, e.target.value)}
                    placeholder={`Option ${aIndex + 1}`}
                    required
                  />
                </div>
              ))}
              
              <p className="text-sm text-gray-600 mt-2">
                Select the radio button next to the correct answer.
              </p>
            </div>
          </div>
        ))}
        
        <div className="mb-8">
          <button 
            type="button" 
            onClick={addQuestion}
            className="btn bg-gray-500 hover:bg-gray-600"
          >
            Add Question
          </button>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/teacher/dashboard')}
            className="btn bg-gray-300 text-black hover:bg-gray-400"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;
