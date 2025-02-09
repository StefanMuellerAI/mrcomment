import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <img 
    src="/images/MrCommentLogo.png" 
    alt="Mr. Comment Logo" 
    className={className}
  />
);

export default Logo; 