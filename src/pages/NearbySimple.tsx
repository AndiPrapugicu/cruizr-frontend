import { useState, useEffect } from "react";

export default function Nearby() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 pt-20">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Descoperă</h1>
        <p className="text-gray-600">Găsește persoane aproape de tine</p>
      </div>

      <div className="text-center">
        <p>Nearby component is working!</p>
      </div>
    </div>
  );
}
