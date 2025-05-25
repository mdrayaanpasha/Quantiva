import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/nav";

export default function Explore() {
  const [exploreItems, setExploreItems] = useState([]);
  const [subscribed, setSubscribed] = useState(new Set());
  const [companyInput, setCompanyInput] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch("https://hackeverse-kjc.vercel.app/api/subscriptions/subscriptions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        const data = await response.json();
        const subscribedCompanies = new Set(data.subscriptions.map((sub) => sub.toLowerCase()));

        const popularCompanies = [
          "Apple", "Microsoft", "Google", "Amazon", "Tesla",
          "Facebook", "Netflix", "Adobe", "Intel", "NVIDIA",
          "Samsung", "IBM", "Sony", "Cisco", "Salesforce",
          "Oracle", "PayPal", "Uber", "Airbnb", "Spotify"
        ];

        const filteredCompanies = popularCompanies.filter(
          (company) => !subscribedCompanies.has(company.toLowerCase())
        );

        const finalExploreItems = filteredCompanies.map((name) => ({
          name,
          image: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, "")}.com`,
        }));

        setExploreItems(finalExploreItems);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSubscribe = async (company) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://hackeverse-kjc.vercel.app/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Subscription failed");

      setSubscribed((prev) => new Set([...prev, company.toLowerCase()]));
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (companyInput) {
      navigate(`/company/${companyInput.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-normal text-neutral-900 mb-3">Market Insights</h1>
          <div className="w-12 h-0.5 bg-neutral-200 mx-auto mb-6"></div>
          <p className="text-neutral-600 max-w-lg mx-auto">
            Discover what Reddit, SEC, and X are discussing about trending companies
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-16 max-w-2xl mx-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-900 text-sm placeholder-neutral-400 transition-colors duration-150"
              placeholder="Search company (e.g. Meta)"
            />
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={!companyInput}
            className="px-6 py-3 bg-neutral-900 text-white rounded-sm text-sm font-medium hover:bg-neutral-800 transition-colors duration-150 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>

        {/* Content Section */}
        {token ? (
          <section>
            <h2 className="text-lg font-normal text-neutral-700 mb-8 text-center border-b border-neutral-200 pb-2 inline-block">
              Popular Companies
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-sm border border-neutral-100">
                    <div className="w-16 h-16 bg-neutral-100 animate-pulse rounded-sm mx-auto mb-3"></div>
                    <div className="h-4 bg-neutral-100 animate-pulse rounded-sm w-3/4 mx-auto mb-4"></div>
                    <div className="h-8 bg-neutral-100 animate-pulse rounded-sm"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {exploreItems.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-sm border border-neutral-100 hover:shadow-xs transition-all duration-150">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-sm object-contain mx-auto mb-3 cursor-pointer"
                      onClick={() => navigate(`./company/${item.name}`)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F5F5F5'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='40' fill='%23AAA' text-anchor='middle' dominant-baseline='middle'%3E${item.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`
                      }}
                    />
                    <p
                      className="text-sm font-medium text-center mb-4 cursor-pointer hover:text-neutral-900 transition-colors duration-150"
                      onClick={() => navigate(`./company/${item.name}`)}
                    >
                      {item.name}
                    </p>
                    <button
                      onClick={() => handleSubscribe(item.name)}
                      disabled={subscribed.has(item.name.toLowerCase())}
                      className="w-full py-2 text-xs font-medium rounded-sm border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-150 disabled:border-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      {subscribed.has(item.name.toLowerCase()) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400">Sign in to explore companies</p>
          </div>
        )}
      </main>
    </div>
  );
}