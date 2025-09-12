"use client";

import React from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface HeroLottieProps {
  animationUrl: string;
}

export default function HeroLottie({ animationUrl }: HeroLottieProps) {
  return (
    <div className="relative z-10 flex justify-center items-center min-h-[600px] overflow-visible">
      <DotLottieReact
        src={animationUrl}
        loop
        autoplay
        style={{ 
          width: '600px',
          height: '600px',
          transform: 'translateX(-10px) translateY(-50px)'
        }}
      />
    </div>
  );
}