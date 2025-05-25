import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Navbar from "../../components/nav";
import AuthenticationReminder from "../../components/AuthenticateAlertCard";
import Select from "react-select";

const tickerOptions = [
  { value: "AAPL", label: "Apple Inc." },
  { value: "GOOGL", label: "Alphabet Inc." },
  { value: "TSLA", label: "Tesla Inc." },
  { value: "MSFT", label: "Microsoft Corporation" },
  { value: "AMZN", label: "Amazon.com Inc." },
];

export default function Portfolio() {
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState({ name: "", date: "", noOfShares: "" });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState({ numerical: [], textAnalysis: "" });
  const token = localStorage.getItem("authToken");



  useEffect(() => {
    if (token) {
      fetchCompanies();
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("https://hackeverse-kjc.vercel.app/api/companies/companies", {
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
      const response = await axios.post("https://hackeverse-kjc.vercel.app/api/investments/score-portfolio", { stocks: companies });
      setStockData({ numerical: response.data.Numerical, textAnalysis: response.data.textAnlaysis });
    } catch (error) {
      console.error("Error fetching stock data:", error.response?.data || error);
    }
  };

  const handleSelectChange = (selectedOption) => {
    setCompany((prev) => ({ ...prev, name: selectedOption.value }));
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
      await axios.post("https://hackeverse-kjc.vercel.app/api/companies/addCompany", companyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompany({ name: "", date: "", noOfShares: "" });
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error adding company:", error.response?.data || error);
    }
  };

  const availableTickerOptions = useMemo(() => {
    const subscribedTickers = companies.map((c) => c.name.toUpperCase());
    return tickerOptions.filter(
      (option) => !subscribedTickers.includes(option.value.toUpperCase())
    );
  }, [companies]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {!token ? (
        <AuthenticationReminder />
      ) : (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 mt-16">
          {/* Portfolio Analysis Section */}
          {loading ? (
            <div className="mb-12 bg-white rounded-sm border border-neutral-100 p-6">
              <div className="h-8 w-48 bg-neutral-100 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-neutral-100 animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                ))}
              </div>
            </div>
          ) : stockData.textAnalysis ? (
            <section className="mb-12 bg-white rounded-sm border border-neutral-100 p-6">
              <h3 className="text-lg font-normal text-neutral-900 mb-4">Portfolio Analysis</h3>
              <div className="prose prose-sm max-w-none text-neutral-600">
                <ReactMarkdown>{stockData.textAnalysis}</ReactMarkdown>
              </div>
            </section>
          ) : null}

          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-normal text-neutral-900">Your Holdings</h1>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-sm hover:bg-neutral-800 transition-colors duration-150 flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Investment</span>
            </button>
          </div>

          {/* Add Investment Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-10 bg-white rounded-sm border border-neutral-100 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Company</label>
                  <Select
                    options={availableTickerOptions}
                    onChange={handleSelectChange}
                    className="text-sm"
                    placeholder="Search ticker..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "1px solid #e5e5e5",
                        borderRadius: "2px",
                        minHeight: "40px",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "#a3a3a3"
                        }
                      })
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    name="date"
                    value={company.date}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Shares</label>
                  <input
                    type="number"
                    name="noOfShares"
                    placeholder="0"
                    value={company.noOfShares}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-sm hover:bg-neutral-800 transition-colors duration-150"
                  >
                    Add Holding
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm px-4 py-2 border border-neutral-200 rounded-sm hover:bg-neutral-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Holdings List */}
          <div className="bg-white rounded-sm border border-neutral-100 overflow-hidden">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border-b border-neutral-100 last:border-b-0 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-sm animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-neutral-100 animate-pulse"></div>
                      <div className="h-3 w-16 bg-neutral-100 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-neutral-100 animate-pulse"></div>
                </div>
              ))
            ) : companies.length > 0 ? (
              companies.map((company, index) => (
                <div key={index} className="p-4 border-b border-neutral-100 last:border-b-0 flex justify-between items-center hover:bg-neutral-50 transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-sm flex items-center justify-center text-xs text-neutral-400">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{company.name}</div>
                      <div className="text-xs text-neutral-500">{company.date}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-neutral-900">{company.noOfShares} shares</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-400 text-sm">No investments added yet</p>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}





