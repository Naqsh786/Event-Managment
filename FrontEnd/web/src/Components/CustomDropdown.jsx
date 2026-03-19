import React, { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ options, value, onChange, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div
                className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {icon && <span className="dropdown-icon">{icon}</span>}
                <span className="dropdown-text">
                    {selectedOption ? selectedOption.label : placeholder || 'Select...'}
                </span>
                <svg
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.label}
                        {value === option.value && (
                            <svg className="check-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomDropdown;
