import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/nav";
import ReactMarkdown from "react-markdown";

export default function CompanyAnalysis() {
  const { companyName } = useParams();
  const [data, setData] = useState({ reddit: null, sec: null, twitter: null, wallstreet: null });
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  if (!companyName) {
    return <p>Company name is missing or invalid.</p>;
  }

  useEffect(() => {
    const endpoints = [
      { key: "reddit", url: `https://hackeverse-kjc.vercel.app/api/getReddit/${companyName}` },
      { key: "sec", url: `https://hackeverse-kjc.vercel.app/api/getSEC/${companyName}` },
      { key: "twitter", url: `https://hackeverse-kjc.vercel.app/api/getTwitter/${companyName}` },
      { key: "wallstreet", url: `https://hackeverse-kjc.vercel.app/api/getWallstreet/${companyName}` }
    ];

    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          endpoints.map(endpoint => axios.get(endpoint.url).catch(() => null))
        );
        const newData = {};
        responses.forEach((response, index) => {
          if (response) newData[endpoints[index].key] = response.data;
        });
        setData(prevData => ({ ...prevData, ...newData }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [companyName]);

  const handleChatSubmit = async () => {
    if (!userInput.trim()) return;
    setChatLoading(true);
    setChatResponse(null);
    
    try {
      const response = await axios.post("https://hackeverse-kjc.vercel.app/api/chat", {
        query: userInput,
        company: companyName
      });
      setChatResponse(response.data.response);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setChatLoading(false);
    setUserInput(""); // Clear input after submission
  };

  return (
    <>
      <Navbar />
      <div className="p-6 mt-20">
        <div className="flex items-center space-x-4 mb-6 ml-2">
          <h1 className="text-4xl font-semibold">How's </h1>
          <img
            src={`https://logo.clearbit.com/${companyName.toLowerCase()}.com`}
            alt={companyName}
            className="w-9 h-9 rounded-full object-cover"
          />
          <h1 className="text-4xl font-semibold">Doin'?</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 mb-10">
            <DataCard title="🤖 What's Reddit Yappin'" bgColor="#FF4500" data={data.reddit} />
            <DataCard title="🦜 What's Tweets are Flyin'?" bgColor="#249EF0" data={data.twitter} />
            <DataCard title="💸 Nerds @ Wallstreet Sayin'" bgColor="#DDD0AC" data={data.wallstreet} />
            <DataCard title="🦅 Waddup with SEC" bgColor="#B68B6B" data={data.sec} />
          </div>
        )}
      </div>

      {chatLoading ? (
        <div className="p-4 bg-gray-100 border-t border-gray-300 mt-4 mb-40 animate-pulse">
          <p className="text-gray-500">Thinking...</p>
        </div>
      ) : (
        chatResponse && (
          <div className="p-4 bg-gray-100 border-t border-gray-300 mt-4 mb-40">
            <p className="text-gray-700">{chatResponse}</p>
          </div>
        )
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-300 flex items-center">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-400 rounded-md"
          placeholder="Ask something about this company..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="ml-2 px-4 py-2 bg-black text-white rounded-md" onClick={handleChatSubmit}>
          Send
        </button>
      </div>
    </>
  );
}

function DataCard({ title, bgColor, data }) {
  return (
    <div className="border border-gray-200 p-4 rounded-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 p-2 rounded-md text-white" style={{ background: bgColor }}>
        {title}
      </h2>
      {data?.summary ? <ReactMarkdown className="prose">{data.summary}</ReactMarkdown> : <p className="text-center text-gray-500">Data unavailable</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg shadow-md bg-gray-100 animate-pulse">
      <div className="h-6 bg-gray-300 w-3/4 mb-4"></div>
      <div className="h-20 bg-gray-200"></div>
    </div>
  );
}
