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
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  className = '',
  isCurrency = false 
}: AnimatedCounterProps) {
  const animatedValue = useAnimatedCounter(value, duration);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  
  useEffect(() => {
    if (value > previousValue) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), duration);
      return () => clearTimeout(timer);
    }
    setPreviousValue(value);
  }, [value, previousValue, duration]);
  
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
