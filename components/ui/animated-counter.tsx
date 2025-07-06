import React, { useEffect, useState } from 'react';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import { formatCurrency } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  isCurrency?: boolean;
  startFromZero?: boolean; // New prop to start animation from 0
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  className = '',
  isCurrency = false,
  startFromZero = false
}: AnimatedCounterProps) {
  const [hasStarted, setHasStarted] = useState(!startFromZero);
  const targetValue = hasStarted ? value : 0;
  const animatedValue = useAnimatedCounter(targetValue, duration);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [previousValue, setPreviousValue] = useState(startFromZero ? 0 : value);
  
  // Start animation from 0 on mount if startFromZero is true
  useEffect(() => {
    if (startFromZero && !hasStarted) {
      const timer = setTimeout(() => setHasStarted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [startFromZero, hasStarted]);
  
  useEffect(() => {
    if (hasStarted && value > previousValue) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), duration);
      return () => clearTimeout(timer);
    }
    if (hasStarted) {
      setPreviousValue(value);
    }
  }, [value, previousValue, duration, hasStarted]);
  
  const displayValue = isCurrency 
    ? formatCurrency(animatedValue)
    : animatedValue.toLocaleString();

  return (
    <span 
      className={`
        ${className} 
        transition-all duration-300 
        ${isIncreasing ? 'scale-110 font-bold' : 'scale-100'}
      `}
    >
      {prefix}{displayValue}{suffix}
      {isIncreasing && (
        <span className="ml-1 text-green-400 animate-bounce">↗</span>
      )}
    </span>
  );
}
