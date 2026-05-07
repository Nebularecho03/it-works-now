"use client";

import { useEffect, useState } from "react";

export function AnimatedStat({
  value,
  suffix = "",
  delay = 0
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    let frame = 0;
    const totalFrames = Math.min(60, value); // More frames for smoother animation
    const step = value / totalFrames;

    const timer = window.setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplayValue(value);
        window.clearInterval(timer);
        return;
      }

      // Easing function for more natural animation
      const progress = frame / totalFrames;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      setDisplayValue(Math.round(step * frame * easedProgress));
    }, 20); // Faster interval for smoother animation

    return () => window.clearInterval(timer);
  }, [value, isVisible]);

  return (
    <span className="inline-block">
      <span className="tabular-nums">
        {displayValue.toLocaleString()}
      </span>
      <span className="ml-1">{suffix}</span>
    </span>
  );
}
