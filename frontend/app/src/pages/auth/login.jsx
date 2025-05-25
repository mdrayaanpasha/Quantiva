import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://hackeverse-kjc.vercel.app/api/auth/login",
        formData
      );

      localStorage.removeItem("authToken");
      localStorage.setItem("authToken", response.data.token);

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/explore";
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-50 via-purple-50 to-pink-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 flex items-center justify-center gap-2">
            🚨 {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 text-sm text-center mb-4 flex items-center justify-center gap-2">
            ✅ {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-400 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-500"
            required
          />


          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-500"
            required
          />

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-lg transition duration-300 ease-in-out
              ${isLoading
                ? "bg-black cursor-not-allowed"
                : "bg-black hover:bg-gray-700 shadow-md hover:shadow-lg"
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                Login <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-600 text-sm">
          <Link
            to="/forgot-password"
            className="text-black hover:text-gray-800 transition duration-200"
          >
            Forgot your password?
          </Link>
          <p className="mt-2">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-black hover:text-gray-800 font-medium transition duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}