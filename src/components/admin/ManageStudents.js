import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc
} from 'firebase/firestore';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get students
  useEffect(() => {
    async function fetchStudents() {
      try {
        // Simply get all users with role 'student', don't sort by name to avoid index issues
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsList = [];
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          
          // Count quiz attempts by this student
          try {
            const attemptsQuery = query(
              collection(db, 'attempts'),
              where('studentId', '==', studentDoc.id)
            );
            
            const attemptsSnapshot = await getDocs(attemptsQuery);
            
            // Calculate average score
            let totalScore = 0;
            let totalPossible = 0;
            
            attemptsSnapshot.forEach(attemptDoc => {
              const attemptData = attemptDoc.data();
              totalScore += attemptData.score || 0;
              totalPossible += attemptData.totalQuestions || 0;
            });
            
            const averagePercentage = totalPossible > 0 
              ? Math.round((totalScore / totalPossible) * 100) 
              : 0;
            
            studentsList.push({
              id: studentDoc.id,
              ...studentData,
              attemptCount: attemptsSnapshot.size,
              averageScore: averagePercentage
            });
          } catch (attemptError) {
            console.error("Error fetching attempts for student:", attemptError);
            
            // Still add the student even if we can't get their attempts
            studentsList.push({
              id: studentDoc.id,
              ...studentData,
              attemptCount: 0,
              averageScore: 0
            });
          }
        }
        
        // Sort locally instead of in the query
        studentsList.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });
        
        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } catch (err) {
        setError('Error loading students: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudents();
  }, []);

  // Filter students
  useEffect(() => {
    let result = [...students];
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      result = result.filter(student => student.grade === gradeFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        (student.name && student.name.toLowerCase().includes(term)) || 
        (student.email && student.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredStudents(result);
  }, [gradeFilter, searchTerm, students]);

  // Delete student
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }
    
    try {
      // Delete student document
      await deleteDoc(doc(db, 'users', studentId));
      
      // Remove from the local state
      setStudents(students.filter(s => s.id !== studentId));
      setFilteredStudents(filteredStudents.filter(s => s.id !== studentId));
      
      alert('Student deleted successfully.');
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading students...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Manage Students</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p>{error}</p>
      </div>}
      
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block mb-1">Search Students</label>
            <input
              id="search"
              type="text"
              className="input"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="gradeFilter" className="block mb-1">Filter by Grade</label>
            <select
              id="gradeFilter"
              className="input"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="all">All Grades</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          Students List 
          {filteredStudents.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>
        
        {filteredStudents.length === 0 ? (
          <p className="text-gray-500">No students found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes Taken</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{student.name || 'No Name'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Grade {student.grade || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.attemptCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.attemptCount > 0 ? `${student.averageScore}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleDeleteStudent(student.id, student.name || student.email)}
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
    </div>
  );
}

export default ManageStudents;
