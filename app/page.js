import Link from 'next/link';
import { useEffect, useState } from 'react';

// ...existing code...

// Updated Google login button with error handling
const GoogleLoginButton = () => {
  const [error, setError] = useState(null);
  
  const handleGoogleLogin = async () => {
    try {
      // Use absolute URL for deployed environment
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      window.location.href = `${baseUrl}/api/auth/signin/google`;
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to connect to Google. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-gray-600 transition-colors duration-300 border border-gray-300 rounded-md group hover:bg-gray-50 focus:outline-none"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium">Continue with Google</span>
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
};

// Updated login form that hides admin information
const LoginForm = () => {
  const [isStudent, setIsStudent] = useState(true);
  
  return (
    <div className="mt-6">
      <div className="flex justify-center mb-4 space-x-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            isStudent ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setIsStudent(true)}
        >
          Student
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            !isStudent ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setIsStudent(false)}
        >
          Teacher
        </button>
      </div>

      {isStudent ? (
        <div className="space-y-4">
          <GoogleLoginButton />
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="flex flex-col space-y-3">
            <Link 
              href="/auth/signin" 
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              Sign in with Email
            </Link>
            <Link 
              href="/auth/student-signup" 
              className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-center text-gray-600">Teacher logins are managed by administrators.</p>
          <Link 
            href="/auth/signin" 
            className="block w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
          >
            Teacher Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

// Remove the first time setup message entirely
// This section has been completely removed

// ...existing code...