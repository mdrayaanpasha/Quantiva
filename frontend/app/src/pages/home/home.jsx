import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/nav";
import axios from "axios";
import { HashtagIcon, ChartBarIcon, BanknotesIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import how2use from "../../assets/imgs/How-2-Use.jpeg";
import AlertBreadCrumb from "../alerts/alert-breadcrumb";

export default function Home() {
  const stockEndpoints = [
    { name: "Reddit Analysis", url: "https://hackeverse-kjc.vercel.app/reddit-stock-analysis", icon: <HashtagIcon className="h-6 w-6 text-blue-500" /> },
    { name: "Twitter Analysis", url: "https://hackeverse-kjc.vercel.app/x-stock-analysis", icon: <ChartBarIcon className="h-6 w-6 text-cyan-500" /> },
    { name: "Wall Street Insights", url: "https://hackeverse-kjc.vercel.app/wallstreet-stock-analysis", icon: <BanknotesIcon className="h-6 w-6 text-green-500" /> },
    { name: "SEC Filings", url: "https://hackeverse-kjc.vercel.app/sec-stock-analysis", icon: <ShieldCheckIcon className="h-6 w-6 text-yellow-500" /> },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const responses = await Promise.all(
        stockEndpoints.map(async (endpoint) => {
          try {
            const res = await axios.get(endpoint.url);
            return { name: endpoint.name, content: res.data.summary, icon: endpoint.icon };
          } catch {
            return { name: endpoint.name, content: "Failed to load data", icon: endpoint.icon };
          }
        })
      );
      setData(responses);
      setLoading(false);
    }
    fetchData();
  }, []);

  const testimonials = [
    { name: "John D.", quote: "Saved me hours of research!", role: "Stock Investor" },
    { name: "Aisha P.", quote: "Best tool for stock insights.", role: "Market Analyst" },
    { name: "Chris M.", quote: "Accurate and insightful reports!", role: "Finance Blogger" },
    { name: "David L.", quote: "Helped me make smarter investments.", role: "Trader" },
    { name: "Sophia R.", quote: "Incredible AI-powered analysis!", role: "Investment Consultant" },
    { name: "Ethan K.", quote: "My go-to tool for stock research.", role: "Portfolio Manager" },
    { name: "Emily V.", quote: "Highly recommend this platform!", role: "Finance Enthusiast" },
    { name: "Michael B.", quote: "Super user-friendly and insightful.", role: "Day Trader" },
    { name: "Olivia N.", quote: "Changed the way I analyze stocks!", role: "Stock Analyst" },
    { name: "Liam T.", quote: "This tool is a game-changer.", role: "Investor" }
  ];

  return (
    <>
      <Navbar />
      <AlertBreadCrumb/>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">Save hours of analysis on your investments.</h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl">Get automated Reddit, X (Twitter), SEC, and Wall Street reports on any public company.</p>
        <Link to="/add-companies">
          <button className="mt-6 px-6 py-3 text-lg font-semibold text-white bg-black rounded-full hover:opacity-90 transition">Get Started</button>
        </Link>
      </div>

      {/* Features Section */}
      <h2 className="text-3xl font-bold text-center mt-16">Why Use Our Platform?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 text-center">
        {stockEndpoints.map((feature, index) => (
          <div key={index} className="border border-gray-200 p-6 rounded-xl shadow-md">
            <div className="flex justify-center">{feature.icon}</div>
            <h3 className="text-xl font-semibold mt-3">{feature.name}</h3>
            <p className="text-gray-600 mt-2">{feature.content}</p>
          </div>
        ))}
      </div>

      {/* How to Use Section */}
      <h2 className="text-3xl font-bold ml-10 mt-10">How to Use It?</h2>
      <div className="flex flex-col md:flex-row items-center justify-between p-10 gap-10">
        <div className="flex flex-col gap-6">
          {["Create Your Account", "Explore Companies", "Add Companies to Your Investment List", "See Personalized Results"].map((step, index) => (
            <div key={index} className="flex items-center gap-5">
              <div className="bg-black h-10 w-10 flex items-center justify-center rounded-full text-white text-center">{index + 1}</div>
              <h1 className="border border-gray-200 text-gray p-2 rounded-md">{step}</h1>
            </div>
          ))}
        </div>
        <img src={how2use} className="h-80 rounded-2xl" alt="How to use" />
      </div>

      {/* Testimonials Section */}
      <h2 className="text-3xl font-bold text-center mt-16">What Our Users Say</h2>
      <div className=" mx-auto overflow-x-auto whitespace-nowrap p-6  rounded-xl shadow-md flex gap-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="min-w-106 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
            <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            <h3 className="text-lg font-semibold mt-2">- {testimonial.name}, {testimonial.role}</h3>
          </div>
        ))}
      </div>

      {/* Try Now Section */}
      <div className="bg-black h-60 mx-4 rounded-xl flex items-center justify-center flex-col text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Start Analyzing Stocks Now</h2>
        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold" onClick={e=>window.location.href="./explore"}>Try Now</button>
      </div>
    </>
  );
}