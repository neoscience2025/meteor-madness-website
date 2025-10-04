"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import s from "./Starfield.module.css";

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Starfield() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generatedStars = Array.from({length:50}).map((_,i)=>({
      left: seededRandom(i * 123) * 100,
      top: seededRandom(i * 456) * 100,
      duration: 2 + seededRandom(i * 789) * 3,
      delay: seededRandom(i * 321) * 2
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className={s.wrap} aria-hidden>
      {stars.map((star, i)=>(
        <motion.div
          key={i}
          className={s.star}
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
          animate={{ opacity:[0.3,1,0.3], scale:[0.5,1,0.5] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </div>
  );
}