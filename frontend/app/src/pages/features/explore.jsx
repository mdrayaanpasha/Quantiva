import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // For navigation
import NavBar from "../../components/nav";

export default function Explore() {
  const [exploreItems, setExploreItems] = useState([]);
  const [subscribed, setSubscribed] = useState(new Set());
  const [companyInput, setCompanyInput] = useState("");  // Track user input
  const navigate = useNavigate();  // To navigate to the analysis page

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://hackeverse-kjc.vercel.app/subscriptions", {
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
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscribe = async (company) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://hackeverse-kjc.vercel.app/subscribe", {
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

  // Function to handle the search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (companyInput) {
      navigate(`/company/${companyInput.toLowerCase()}`);
    }
  };

  return (
    <>
      <NavBar />
      <div className="p-4 mt-20">
      <div className="flex flex-col items-center justify-center  px-6 mb-10 mt-20">
  <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
    Whats Reddit, SEC, X Sayin' Bout..
  </h1>


  {/* Search Box */}
  <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-2 flex items-center justify-center gap-2 ">
    <input
      type="text"
      value={companyInput}
      onChange={(e) => setCompanyInput(e.target.value)}
      className="w-full px-5 py-3 h-12 text-sm bg-white text-gray-900 rounded-md  border border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-all duration-300 ease-in-out"
      placeholder="eg: meta"
    />
    <button
      type="submit"
      className={`w-66 px-5 py-3  h-12 rounded-md text-white text-sm bg-black transition-all duration-300 ease-in-out shadow-md ${
        !companyInput ? " cursor-not-allowed" : ""
      }`}
      disabled={!companyInput}
    >
      Search Analysis
    </button>
  </form>
</div>




<h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
  Add 'em as investments
  </h1>
        <div className="flex items-center justify-evenly flex-wrap gap-10">
          {exploreItems.map((item, index) => (
            <div key={index} className=" p-4 rounded-lg border h-50 w-50 p-5 border-gray-200 flex flex-col items-center" onClick={e=>window.location.href=`./company/${item.name}`}>
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-md object-cover mb-2"
              />
              <p className="text-center font-medium">{item.name}</p>
              <button
                onClick={() => handleSubscribe(item.name)}
                disabled={subscribed.has(item.name.toLowerCase())}
                className="mt-2 px-4 py-2 bg-black text-white rounded-lg disabled:bg-gray-400"
              >
                {subscribed.has(item.name.toLowerCase()) ? "Subscribed" : "Add ➕ "}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
