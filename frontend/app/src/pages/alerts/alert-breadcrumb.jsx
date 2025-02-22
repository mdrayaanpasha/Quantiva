import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function AlertBreadCrumb() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [visible, setVisible] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get("https://hackeverse-kjc.vercel.app/subscriptions", getAuthHeader());
        setSubscriptions(response.data.subscriptions || []);
      } catch (err) {
        console.error("Error fetching subscriptions", err);
      }
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const fetchDataAPI = async () => {
      if (subscriptions.length > 0) {
        try {
          const response = await axios.post("https://hackeverse-kjc.vercel.app/alert-short", { companies: subscriptions });
          setSummary(response.data.summary);
          setVisible(true);
          
          setTimeout(() => {
            setVisible(false);
          }, 10000);
        } catch (error) {
          console.error(error);
        }
      }
    };
    
    fetchDataAPI();
  }, [subscriptions]);

  if (!localStorage.getItem("authToken")) {
    return(
        <>
        </>
    )
  }

  return (
    <AnimatePresence>
      {visible && summary && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-5 right-5 bg-black text-white p-4 rounded-xl shadow-lg w-80 flex justify-between items-center"
          onClick={e=>window.location.href="./investments"}
        >
          <p className="text-sm font-medium">{summary}</p>
          <button className="text-gray-400 hover:text-white" onClick={() => setVisible(false)}>✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
