import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../../components/nav";

const API_URL = "https://hackeverse-kjc.vercel.app/"; // Change if deployed

const AddCompanies = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [company, setCompany] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/subscriptions`, getAuthHeader());
        setSubscriptions(response.data.subscriptions || []);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscribe = async () => {
    if (!company.trim()) return alert("Enter a company name");
    if (subscriptions.some((sub) => sub.toLowerCase() === company.toLowerCase())) {
      return alert("Already subscribed to this company!");
    }

    setSubscriptions((prev) => [...prev, company]);
    setCompany("");

    try {
      await axios.post(`${API_URL}/subscribe`, { company }, getAuthHeader());
    } catch (err) {
      setError(err.response?.data?.error || "Subscription failed");
      setSubscriptions((prev) => prev.filter((sub) => sub !== company)); // Revert UI change
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen  mt-15">
        {/* Input Section */}
        <div className="w-full bg-white py-12 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Subscribe to Companies</h1>
            <div className="flex space-x-4">
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setError(null);
                }}
                placeholder="Enter company name"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
              <button
                onClick={handleSubscribe}
                className="bg-black text-white p-4 rounded-xl hover:cursor-pointer transition duration-200 flex items-center justify-center"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="w-full py-12">
          <div className=" mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Subscribed Companies</h2>
            {error && <p className="text-red-500 text-sm text-center mb-6">{error}</p>}

            {loading ? (
  <p className="text-gray-500 text-center">Loading...</p>
) : subscriptions.length > 0 ? (
  <div className="flex overflow-x-auto space-x-4 p-4 rounded-md mb-8">
    {subscriptions.map((sub, idx) => (
      <div
        key={idx}
        className="border border-gray-200 w-40 flex-shrink-0 bg-white p-4 rounded-md text-center cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => window.location.href = `./company/${sub}`}
      >
        <img
          src={`https://logo.clearbit.com/${sub}.com`}
          alt={sub}
          className="w-18 h-18 mx-auto mb-2 rounded-md object-cover"
        />
        <p className="text-gray-800 font-medium">{sub}</p>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500 text-center">No subscriptions yet</p>
)}

          </div>
        </div>
      </div>
    </>
  );
};

export default AddCompanies;