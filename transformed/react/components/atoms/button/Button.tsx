import React from 'react';
import './Button.css';

interface ButtonProps {
  label: string;
  enabled?: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, enabled = true, onClick, ...props }) => {
  return (
    <button
      className="atom-button"
      disabled={!enabled}
      onClick={enabled ? onClick : undefined}
      {...props}
    >
      {label}
    </button>
  );
};

export default Button;