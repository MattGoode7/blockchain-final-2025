import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface MenuButtonProps {
  onToggle: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden p-2 rounded-lg text-white hover:bg-blue-600 transition-colors"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}; 