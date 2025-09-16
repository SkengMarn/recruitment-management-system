import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ 
  text, 
  disabled = false, 
  speed = 2, 
  className = '' 
}) => {
  return (
    <span 
      className={`relative inline-block text-white font-medium ${className}`}
      style={disabled ? {} : {
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '-200% 0',
        animation: `shine ${speed}s ease-in-out infinite`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
