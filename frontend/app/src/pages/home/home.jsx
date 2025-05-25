import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/nav";
import {
  HashtagIcon, ChartBarIcon, BanknotesIcon,
  ShieldCheckIcon, HeartIcon, BellAlertIcon,
  ArrowRightIcon, GlobeAltIcon, CpuChipIcon,
  UserGroupIcon, ChartPieIcon, ClockIcon, DocumentTextIcon, MagnifyingGlassCircleIcon, LightBulbIcon
} from "@heroicons/react/24/solid";
import how2use from "../../assets/imgs/How-2-Use.jpeg";

export default function Home() {
  const [keyMetrics, setKeyMetrics] = useState([
    { value: "1M+", label: "Analyses Daily", icon: <CpuChipIcon className="h-6 w-6" /> },
    { value: "500K+", label: "Active Users", icon: <UserGroupIcon className="h-6 w-6" /> },
    { value: "95%", label: "Prediction Accuracy", icon: <ChartPieIcon className="h-6 w-6" /> },
    { value: "24/7", label: "Real-time Coverage", icon: <ClockIcon className="h-6 w-6" /> },
  ]);

  const pillars = [
    {
      title: "Signal over Noise",
      icon: <ChartBarIcon className="h-6 w-6 text-indigo-600" />,
      description: "We extract actionable insights, not just data dumps. Our models prioritize signal clarity over volume."
    },
    {
      title: "Transparent AI",
      icon: <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />,
      description: "No black boxes. Understand how predictions are made and what data drives them."
    },
    {
      title: "Human-in-the-Loop",
      icon: <HeartIcon className="h-6 w-6 text-rose-600" />,
      description: "Let analysts fine-tune models with domain expertise — boosting trust & customizability."
    }
  ];


  const features = [
    {
      name: "Social Sentiment Analysis",
      icon: <HashtagIcon className="h-7 w-7 text-blue-500" />,
      description: "Real-time sentiment tracking across Reddit, Twitter, and financial forums",
      gradient: "from-blue-50 to-blue-100"
    },
    {
      name: "Market Intelligence",
      icon: <ChartBarIcon className="h-7 w-7 text-emerald-500" />,
      description: "AI-powered insights from SEC filings and earnings calls",
      gradient: "from-emerald-50 to-emerald-100"
    },
    {
      name: "Portfolio Analytics",
      icon: <BanknotesIcon className="h-7 w-7 text-purple-500" />,
      description: "Dynamic risk assessment and performance forecasting",
      gradient: "from-purple-50 to-purple-100"
    },
  ];

  const testimonials = [
    { name: "Sarah L.", role: "Portfolio Manager", text: "Transformed how we approach market research", company: "BlackRock" },
    { name: "Michael T.", role: "Chief Analyst", text: "The most comprehensive analysis platform available", company: "Goldman Sachs" },
    { name: "Emma R.", role: "Investment Strategist", text: "Cut our research time by 70%", company: "Fidelity" },
    { name: "David K.", role: "Hedge Fund Manager", text: "Essential tool for modern investors", company: "Bridgewater" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 px-6 mt-10 text-center overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
            AI-Powered Investment Intelligence
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Harness machine learning to analyze market data from multiple sources and make informed investment decisions
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/explore" className="inline-flex items-center px-8 py-4 bg-black text-white rounded-xl hover:bg-blue-700 transition-all">
              Start For Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>

          </div>
        </div>
      </section>



      <section className="">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-6">

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <img src={how2use} alt="Platform interface" className="rounded-2xl shadow-xl" />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Streamlined Investment Research</h2>
              <div className="space-y-8">
                {[
                  { title: "Multi-source Aggregation", text: "Combine data from SEC filings, news outlets, and social media", icon: <MagnifyingGlassCircleIcon className="h-6 w-6 text-blue-600" /> },
                  { title: "AI-powered Analysis", text: "Natural language processing for sentiment and trend detection", icon: <LightBulbIcon className="h-6 w-6 text-blue-600" /> },
                  { title: "Smart Notifications", text: "Real-time alerts for critical market movements", icon: <BellAlertIcon className="h-6 w-6 text-blue-600" /> },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Financial Professionals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of investors and institutions using our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} • {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We don’t just analyze data — we help you decode the markets with clarity, transparency, and precision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">{item.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-6">Start For Free Today</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience professional-grade investment analysis with no commitment
          </p>
          <div className="flex justify-center gap-4">

            <Link to="/register" className="px-8 py-4 bg-white  rounded-xl hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
                <li><Link to="/press" className="text-gray-600 hover:text-gray-900">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
                <li><Link to="/research" className="text-gray-600 hover:text-gray-900">Market Research</Link></li>
                <li><Link to="/api" className="text-gray-600 hover:text-gray-900">Developer API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
                <li><Link to="/security" className="text-gray-600 hover:text-gray-900">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link to="/twitter" className="text-gray-600 hover:text-gray-900">Twitter</Link></li>
                <li><Link to="/linkedin" className="text-gray-600 hover:text-gray-900">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">&copy; {new Date().getFullYear()} Quantiva. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}