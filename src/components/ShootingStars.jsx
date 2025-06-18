import React, { useState, useEffect } from "react";

const ShootingStars = () => {
  const [explosions, setExplosions] = useState([]);

  // Create explosion effect
  const createExplosion = () => {
    const id = Math.random();
    const leftPosition = Math.random() * 80 + 10; // Random position between 10% and 90%

    setExplosions((prev) => [...prev, { id, left: `${leftPosition}%` }]);

    // Remove explosion after animation
    setTimeout(() => {
      setExplosions((prev) => prev.filter((exp) => exp.id !== id));
    }, 600);
  };

  // Create new explosion every few seconds
  useEffect(() => {
    const interval = setInterval(createExplosion, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>

      {/* Explosions */}
      {explosions.map(({ id, left }) => (
        <div key={id} className="star-explosion" style={{ left }} />
      ))}
    </div>
  );
};

export default ShootingStars;
