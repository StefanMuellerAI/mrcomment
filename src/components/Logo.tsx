import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <img src="../images/MrCommentLogo.png" alt="Logo" className={className} />
  );
};

export default Logo; 