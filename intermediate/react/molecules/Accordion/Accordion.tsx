import React, { useState, ReactNode } from 'react';
import './Accordion.css';

interface AccordionProps {
  title: string;
  content: ReactNode;
  open?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, content, open = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="molecule-accordion">
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