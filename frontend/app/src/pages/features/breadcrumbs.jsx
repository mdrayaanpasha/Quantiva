import { useState, useEffect } from "react";

export default function Breadcrumbs({ message, type = "info" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const colors = {
    info: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className={`text-sm px-4 py-2 rounded-lg shadow-md ${colors[type]} transition-opacity duration-500`}>
      {message}
    </div>
  );
}
