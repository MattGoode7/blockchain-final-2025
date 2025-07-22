import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { MetaMaskConnect } from '../MetaMaskConnect';
import { MenuButton } from './MenuButton';

interface NavbarProps {
  onCheckApiHealth: () => void;
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCheckApiHealth, onMenuToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cerrar dropdown cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="bg-[#1e293b] shadow-lg">
      <div className="py-4 sm:py-6 px-4">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <MenuButton onToggle={onMenuToggle} />
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              <img 
                src="/contract.svg" 
                alt="CFP" 
                className="h-8 w-8 sm:h-10 sm:w-10" 
              />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-md opacity-100">
                CFP
              </h1>
            </div>
          </div>

          {/* Acciones del Usuario - Desktop */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button
              onClick={onCheckApiHealth}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow"
            >
              Probar conexión API
            </button>
            <MetaMaskConnect />
          </div>

          {/* Acciones del Usuario - Mobile Dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow"
            >
              <span>Acciones</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-[#1e293b] rounded-lg shadow-xl border border-gray-600 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-4">
                  <button
                    onClick={() => {
                      onCheckApiHealth();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 transition-colors text-sm rounded-lg border border-gray-600"
                  >
                    Probar conexión API
                  </button>
                  <div className="border-t border-gray-600 pt-4">
                    <MetaMaskConnect />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 