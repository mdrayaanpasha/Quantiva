import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Navbar from "../../components/nav";

export default function Investment() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [classifications, setClassifications] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsAuthenticated(!!token);

        if (token) {
            setLoading(true);
            axios.get("https://hackeverse-kjc.vercel.app/subscriptions", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const companies = response.data.subscriptions || [];
                setSubscriptions(companies);
                return Promise.all([
                    axios.post("https://hackeverse-kjc.vercel.app/investment-bad-analysis", { companies }),
                    axios.post("https://hackeverse-kjc.vercel.app/investment-good-analysis", { companies }),
                ]);
            })
            .then(([bad, good]) => {
                setClassifications({ good: good.data, bad: bad.data });
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
        }
    }, []);

    const renderAnalysis = (data) => {
        if (!data || !data.analysis) return <p className="text-gray-600">No analysis available</p>;
        return <ReactMarkdown className="text-left text-gray-700">{data.analysis}</ReactMarkdown>;
    };

    return (
        <>
            {isAuthenticated ? (
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Navbar />
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-6 mt-20">⚖️ The Verdict!</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {loading ? (
                            <p className="text-gray-500 text-center">Loading analysis...</p>
                        ) : (
                            [
                                { title: "🔥They are killin' it!!", data: classifications.good, bgColor: "bg-green-400" },
                                { title: "🤨 They're OK, or are they?", data: classifications.bad, bgColor: "bg-red-400" },
                            ].map(({ title, data, bgColor }, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                                    <h3 className={`text-xl text-center font-bold text-white ${bgColor} p-2 rounded-md mb-5`}>{title}</h3>
                                    {renderAnalysis(data)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
                    <div className="text-center bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Please Register or Login</h2>
                        <p className="text-gray-600 mb-6">You need an account to access investment insights.</p>
                        <div className="flex flex-col space-y-4">
                            <button onClick={() => window.location.href = "/login"} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Login</button>
                            <button onClick={() => window.location.href = "/register"} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Register</button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 text-center mt-10 mb-6">Click to see How they're doin'</h1>
            <div className="flex flex-wrap justify-center gap-4 px-4">
                {subscriptions.length > 0 ? (
                    subscriptions.map((company, index) => (
                        <div key={index} className="w-32 sm:w-40 bg-white p-4 rounded-lg border border-gray-100 text-center shadow-md cursor-pointer hover:shadow-lg transition-all" onClick={() => window.location.href=`./company/${company}`}>
                            <img src={`https://logo.clearbit.com/${company}.com`} alt={company} className="w-16 h-16 mx-auto mb-2" />
                            <p className="text-gray-800 font-medium text-sm sm:text-base">{company}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No subscriptions found</p>
                )}
            </div>
        </>
    );
}