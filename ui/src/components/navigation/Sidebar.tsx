import React from 'react';
import { 
  DocumentTextIcon, 
  UserCircleIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useMetamask } from '../../hooks/useMetaMask';

interface SidebarProps {
  activeView: 'llamados' | 'registrar-usuario' | 'resolver-nombres' | 'admin';
  onViewChange: (view: 'llamados' | 'registrar-usuario' | 'resolver-nombres' | 'admin') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isOpen, 
  onClose 
}) => {
  const { isOwner } = useMetamask();

  const menuItems = [
    {
      id: 'llamados' as const,
      label: 'Llamados',
      icon: DocumentTextIcon,
      description: 'Gestionar llamados y propuestas'
    },
    {
      id: 'registrar-usuario' as const,
      label: 'Registrar Usuario ENS',
      icon: UserCircleIcon,
      description: 'Registrar nombres de usuario'
    },
    {
      id: 'resolver-nombres' as const,
      label: 'Resolver Nombres',
      icon: MagnifyingGlassIcon,
      description: 'Resolver nombres y direcciones ENS'
    },
    {
      id: 'admin' as const,
      label: 'Panel de Administración',
      icon: Cog6ToothIcon,
      description: 'Gestión del sistema (solo admin)',
      adminOnly: true
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isOwner)
  );

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto lg:border-r lg:border-gray-700
      `}>
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Navegación</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-blue-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-blue-600/20 hover:text-white'
                    }
                    ${item.adminOnly ? 'border-l-2 border-yellow-500' : ''}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              Sistema de Propuestas
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 