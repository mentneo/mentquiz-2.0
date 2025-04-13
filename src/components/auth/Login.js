import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center">Quiz App Login</h2>
        
        <div className="space-y-6">
          <Link to="/admin/login" className="btn block w-full text-center bg-purple-600 hover:bg-purple-700">
            Login as Admin
          </Link>
          
          <Link to="/teacher/login" className="btn block w-full text-center bg-blue-600 hover:bg-blue-700">
            Login as Teacher
          </Link>
          
          <Link to="/student/login" className="btn block w-full text-center bg-green-600 hover:bg-green-700">
            Login as Student
          </Link>
        </div>
        
        {/* Add setup link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">First time running the app?</p>
          <Link to="/setup" className="text-blue-600 hover:underline">
            Click here to set up test accounts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
