import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { formatStatsList, HOME_STATS } from "../data/stats";
import CountUp from "./CountUp";


const Stats = () => {
  const [statsList, setStatsList] = useState(HOME_STATS);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.stats) {
          setStatsList(formatStatsList(data.stats));
        }
      })
      .catch(() => {
        // keep baseline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white dark:bg-transparent pb-10 px-6 md:px-8">
      <div className="max-w-7xl mx-auto bg-[var(--jb-bg)] rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 justify-center py-6 px-4 group">
              <div className="bg-white dark:bg-[#181824] rounded-full p-2 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                <Icon size={20} className="text-[var(--jb-primary)]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white leading-tight text-lg">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Stats;
