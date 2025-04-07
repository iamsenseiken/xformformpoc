import React from 'react';
import './Button.css';

/**
 * Basic button component
 * @param {string} label - The text to display on the button
 * @param {boolean} enabled - Whether the button is enabled or disabled
 * @param {function} onClick - Callback function for click events
 * @param {object} props - Additional props to pass to the button element
 */
const Button = ({ label, enabled = true, onClick, ...props }) => {
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
