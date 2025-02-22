import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    axios.post("https://hackeverse-kjc.vercel.app/api/verify", { token })
      .then(res => {
        setMessage(res.data.message);
        localStorage.setItem("authToken", res.data.token); // Store JWT token
        setTimeout(() => navigate("/dashboard"), 2000); // Redirect to dashboard
      })
      .catch(() => setMessage("Invalid or expired token"));
  }, [token, navigate]);

  return <h2>{message}</h2>;
};

export default Verify;
