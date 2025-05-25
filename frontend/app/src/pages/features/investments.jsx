import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Navbar from "../../components/nav";
import AuthenticationReminder from "../../components/AuthenticateAlertCard";

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
            axios.get("https://hackeverse-kjc.vercel.app/api/subscriptions/subscriptions", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const companies = response.data.subscriptions || [];
                    setSubscriptions(companies);
                    return Promise.all([
                        axios.post("https://hackeverse-kjc.vercel.app/api/investments/investment-bad-analysis", { companies }),
                        axios.post("https://hackeverse-kjc.vercel.app/api/investments/investment-good-analysis", { companies }),
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
        if (!data || !data.analysis) return (
            <div className="h-full flex items-center justify-center p-8">
                <p className="text-neutral-400">No analysis available</p>
            </div>
        );
        return (
            <ReactMarkdown className="prose prose-sm max-w-none text-neutral-600">
                {data.analysis}
            </ReactMarkdown>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {isAuthenticated ? (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    {/* Header */}
                    <div className="mb-16 text-center mt-10">
                        <h1 className="text-3xl font-normal text-neutral-900 mb-1">Portfolio Insights</h1>
                        <div className="w-12 h-0.5 bg-neutral-200 mx-auto mt-4"></div>
                    </div>

                    {/* Loading state */}
                    {loading ? (
                        <>
                            {/* Skeleton for Analysis Cards */}
                            <section className="mb-24">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {[...Array(2)].map((_, index) => (
                                        <div key={index} className="bg-white rounded-sm border border-neutral-100">
                                            <div className="flex items-center px-6 py-4 border-b border-neutral-100">
                                                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-neutral-200' : 'bg-neutral-200'} mr-3`}></div>
                                                <div className="h-5 w-32 bg-neutral-100 animate-pulse rounded-sm"></div>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className="h-4 bg-neutral-100 animate-pulse rounded-sm" style={{
                                                        width: `${Math.random() * 40 + 60}%`
                                                    }}></div>
                                                ))}
                                                <div className="h-4 bg-neutral-100 animate-pulse rounded-sm w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Skeleton for Tracked Companies */}
                            <section>
                                <div className="flex justify-center mb-8">
                                    <div className="h-6 w-48 bg-neutral-100 animate-pulse rounded-sm"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {[...Array(6)].map((_, index) => (
                                        <div key={index} className="group block p-3 hover:bg-white transition-colors duration-150 rounded-sm">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 mb-2 bg-neutral-100 rounded-sm animate-pulse"></div>
                                                <div className="h-4 w-16 bg-neutral-100 animate-pulse rounded-sm"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <>
                            {/* Analysis Cards */}
                            <section className="mb-24">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {[
                                        {
                                            title: "Strong Performers",
                                            data: classifications.good,
                                            indicator: "bg-emerald-500"
                                        },
                                        {
                                            title: "Require Review",
                                            data: classifications.bad,
                                            indicator: "bg-amber-500"
                                        },
                                    ].map(({ title, data, indicator }, index) => (
                                        <div key={index} className="bg-white rounded-sm shadow-xs border border-neutral-100">
                                            <div className="flex items-center px-6 py-4 border-b border-neutral-100">
                                                <div className={`w-2 h-2 rounded-full ${indicator} mr-3`}></div>
                                                <h3 className="text-base font-medium text-neutral-800">{title}</h3>
                                            </div>
                                            <div className="p-6">
                                                {renderAnalysis(data)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Tracked Companies */}
                            <section>
                                <div className="flex justify-center mb-8">
                                    <h2 className="text-lg font-normal text-neutral-700 inline-block border-b border-neutral-200 pb-1">
                                        Your Tracked Companies
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {subscriptions.length > 0 ? (
                                        subscriptions.map((company, index) => (
                                            <a
                                                key={index}
                                                href={`./company/${company}`}
                                                className="group block p-3 hover:bg-white transition-colors duration-150 rounded-sm"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 mb-2 bg-neutral-100 rounded-sm overflow-hidden flex items-center justify-center">
                                                        <img
                                                            src={`https://logo.clearbit.com/${company}.com?size=80`}
                                                            alt={company}
                                                            className="w-full h-full object-contain p-1"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F5F5F5'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='40' fill='%23AAA' text-anchor='middle' dominant-baseline='middle'%3E${company.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E"
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-normal text-neutral-600 group-hover:text-neutral-900 transition-colors duration-150 truncate w-full text-center">
                                                        {company}
                                                    </span>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="col-span-full flex justify-center py-12">
                                            <p className="text-neutral-400 text-sm">No companies being tracked</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            ) : (
                <AuthenticationReminder />
            )}
        </div>
    );
}