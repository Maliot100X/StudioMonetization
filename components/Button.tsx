import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  active?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  active = false, 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center transition-colors duration-200 font-medium rounded-full";
  
  const variants = {
    primary: "bg-yt-red text-white hover:bg-red-600 px-4 py-2 text-sm",
    secondary: "bg-[#272727] text-white hover:bg-[#3f3f3f] px-3 py-1.5 text-sm",
    ghost: "bg-transparent text-white hover:bg-[#272727] px-3 py-2",
    icon: "bg-transparent text-white hover:bg-[#272727] p-2 rounded-full",
  };

  const activeStyle = active ? "bg-white text-black hover:bg-gray-200" : variants[variant];

  return (
    <button 
      className={`${baseStyles} ${variant === 'icon' ? variants.icon : activeStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};