/**
 * Logo Component
 * Reusable logo component that displays the Ceeqbot logo consistently across the app
 */

import React from 'react';

const Logo = ({ 
  size = 'default', 
  showText = true, 
  className = '',
  textClassName = '',
  imageClassName = ''
}) => {
  const sizeConfig = {
    small: {
      image: 'w-24 h-6',
      text: 'text-base font-semibold',
      container: 'gap-2'
    },
    default: {
      image: 'w-32 h-8',
      text: 'text-xl font-bold',
      container: 'gap-3'
    },
    large: {
      image: 'w-48 h-12',
      text: 'text-3xl font-bold',
      container: 'gap-4'
    },
    auth: {
      image: 'w-40 h-10',
      text: 'text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent',
      container: 'gap-3'
    },
    navbar: {
      image: 'w-28 h-7',
      text: 'text-lg font-bold text-green-600',
      container: 'gap-2'
    },
    sidebar: {
      image: 'w-24 h-6',
      text: 'text-base font-semibold text-green-600',
      container: 'gap-2'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  if (!showText) {
    return (
      <img 
        src="/logo.png" 
        alt="Ceeqbot CRM" 
        className={`object-contain ${config.image} ${imageClassName}`}
      />
    );
  }

  return (
    <div className={`flex items-center ${config.container} ${className}`}>
      <img 
        src="/logo.png" 
        alt="Ceedpods CRM" 
        className={`object-contain ${config.image} ${imageClassName}`}
      />
      {/* {showText && (
        <span className={`${config.text} ${textClassName}`}>
          Ceeqbot
        </span>
      )} */}
    </div>
  );
};

export default Logo;