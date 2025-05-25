import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your account, hang tight...");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'

  useEffect(() => {
    // Only attempt verification if a token exists
    if (!token) {
      setMessage("No verification token found.");
      setStatus("error");
      // Optional: Redirect to a signup/login page after a delay if no token
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    axios.post("https://hackeverse-kjc.vercel.app/api/verify", { token })
      .then(res => {
        setMessage(res.data.message || "Account verified successfully!");
        setStatus("success");
        localStorage.setItem("authToken", res.data.token); // Store JWT token
        setTimeout(() => navigate("/dashboard"), 2000); // Redirect to dashboard
      })
      .catch(err => {
        setMessage(err.response?.data?.message || "Verification failed. Please try again or request a new link.");
        setStatus("error");
        // Optional: Redirect to a helpful page (e.g., resend verification) after a delay
        setTimeout(() => navigate("/explore"), 3000);
      });
  }, [token, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case "success":
        return (
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case "error":
        return (
          <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full transition-all duration-300 transform scale-100 hover:scale-[1.02]">
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>
        <h2 className={`text-3xl font-bold mb-4 ${status === 'loading' ? 'text-gray-800 dark:text-gray-200' :
          status === 'success' ? 'text-green-600 dark:text-green-400' :
            'text-red-600 dark:text-red-400'
          }`}>
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Success!' : 'Oops!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {message}
        </p>
        {status === 'error' && (
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>You might need to request a new verification link.</p>
            <Link to="/resend-verification" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200 mt-2 block">
              Resend Verification Email
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition duration-200 mt-2 block">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;