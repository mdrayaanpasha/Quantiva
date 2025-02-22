import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Navbar from "../../components/nav";

export default function Portfolio() {
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState({ name: "", date: "", noOfShares: "" });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState({ numerical: [], textAnalysis: "" });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return console.log("No auth token found");
      
      const response = await axios.get("https://hackeverse-kjc.vercel.app/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
      fetchStockData(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (companies) => {
    try {
      const response = await axios.post("https://hackeverse-kjc.vercel.app/fetchStockPrices", companies);
      setStockData({ numerical: response.data.Numerical, textAnalysis: response.data.textAnlaysis });
    } catch (error) {
      console.error("Error fetching stock data:", error.response?.data || error);
    }
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return console.log("No auth token found");

      const companyData = { ...company, noOfShares: Number(company.noOfShares) };
      await axios.post("https://hackeverse-kjc.vercel.app/addCompany", companyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompany({ name: "", date: "", noOfShares: "" });
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error adding company:", error.response?.data || error);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="bg-white text-black min-h-screen p-6 font-sans">
      
      
      {stockData.textAnalysis && (
        <div className="mt-6 p-4 border border-gray-300 rounded-md p-5 mt-20">
          <h3 className="text-xl font-bold mb-2">Investment Portfolio Analysis</h3>
          <ReactMarkdown className="text-sm leading-relaxed">{stockData.textAnalysis}</ReactMarkdown>
        </div>
      )}

<h1 className="text-3xl font-bold mb-6 mt-10">Portfolio</h1>

<button className="px-4 py-2 bg-black text-white rounded-md hover:opacity-80" onClick={() => setShowForm(true)}>
        Add Company
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border border-gray-200 rounded-md ">
          <input type="text" name="name" placeholder="Company Name" value={company.name} onChange={handleChange} className="block w-full p-2 border border-gray-200 rounded-md mb-2 focus:outline-none" required />
          <input type="date" name="date" value={company.date} onChange={handleChange} className="block w-full p-2 border border-gray-200 rounded-md mb-2 focus:outline-none" required />
          <input type="number" name="noOfShares" placeholder="Number of Shares" value={company.noOfShares} onChange={handleChange} className="block w-full p-2 border border-gray-200 rounded-md mb-2 focus:outline-none" required />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:opacity-80">Submit</button>
            <button type="button" className="px-4 py-2 bg-gray-100 text-black rounded-md hover:opacity-80" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
    </>
  );
}