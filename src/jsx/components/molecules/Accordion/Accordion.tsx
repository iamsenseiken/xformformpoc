import React, { useState } from 'react';
import './Accordion.css';

/**
 * Accordion component that can be toggled open and closed
 * @param {string} title - The title of the accordion
 * @param {ReactNode} content - The content to display when accordion is open
 * @param {boolean} open - Whether the accordion is initially open or closed
 * @param {object} props - Additional props to pass to the component
 */
const Accordion = ({ title, content, open = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(open);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="molecule-accordion" {...props}>
      <div 
        className={`accordion-title ${isOpen ? 'open' : ''}`} 
        onClick={toggleAccordion}
      >
        {title}
      </div>
      {isOpen && (
        <div className="accordion-content">
          {content}
        </div>
      )}
    </div>
  );
};

export default Accordion;