import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages on input change
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://hackeverse-kjc.vercel.app/api/register",
        formData
      );
      setSuccess(response.data.message || "Registration successful!");
      // Optionally redirect after success
      // setTimeout(() => { window.location.href = "/login"; }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md  transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-4xl font-extrabold text-center text-black mb-8 tracking-tight">
          Join Us
        </h2>

        {/* Error and Success Messages */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4 flex items-center justify-center gap-2">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-sm text-center mb-4 flex items-center justify-center gap-2">
            🎉 {success}
          </p>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-neutral-800 text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white text-white rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition duration-200 placeholder-neutral-500"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-800 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white text-white rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition duration-200 placeholder-neutral-500"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-800 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Set a strong password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white text-white rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition duration-200 placeholder-neutral-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-lg transition duration-300 ease-in-out
              ${isLoading
                ? "bg-neutral-700 cursor-not-allowed"
                : "bg-black hover:bg-neutral-800 shadow-md hover:shadow-lg"
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              "Register"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-neutral-800 text-sm">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-neutral-500 hover:text-neutral-400 font-medium transition duration-200"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}