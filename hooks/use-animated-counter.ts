import { useEffect, useState, useRef } from 'react';

export function useAnimatedCounter(endValue: number, duration: number = 1000) {
  const [currentValue, setCurrentValue] = useState(endValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(endValue);

  useEffect(() => {
    // If this is the first render or the value hasn't changed, don't animate
    if (startValueRef.current === endValue) {
      setCurrentValue(endValue);
      return;
    }

    const startValue = startValueRef.current;
    const difference = endValue - startValue;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValue + (difference * easeOut);
      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        startValueRef.current = endValue;
        startTimeRef.current = undefined;
      }
    };

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start new animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endValue, duration]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return Math.round(currentValue);
}
