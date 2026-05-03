"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/app/utils/cn';

interface FluidGlassProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  intensity?: number; // 0 to 1
  tintColor?: string;
  borderRadius?: string;
}

export const FluidGlass: React.FC<FluidGlassProps> = ({
  children,
  className,
  containerClassName,
  intensity = 0.5,
  tintColor = 'var(--color-bg-glass)',
  borderRadius = '2.5rem',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for the "fluid" tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      className={cn("flex items-center justify-center w-full h-full", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <motion.div
        style={{
          borderRadius: borderRadius,
          backgroundColor: tintColor,
        }}
        className={cn(
          "relative overflow-hidden border border-glass-border shadow-2xl w-full h-full",
          "backdrop-blur-3xl backdrop-saturate-150",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-glass-hover before:to-transparent before:opacity-30 before:pointer-events-none",
          className
        )}
      >
        {/* Fluid Highlight Layer */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => {
                const posX = (Number(x) + 0.5) * 100;
                const posY = (Number(y) + 0.5) * 100;
                return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,${0.08 * intensity}) 0%, transparent 50%)`;
              }
            )
          }}
        />
        
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
