import { useState, useEffect } from 'react'
import './index.css'
import { Navbar } from './components/navigation/Navbar'
import { Sidebar } from './components/navigation/Sidebar'
import { LlamadosView } from './components/views/LlamadosView'
import { RegistrarUsuarioView } from './components/views/RegistrarUsuarioView'
import { ResolverView } from './components/views/ResolverView'
import { AdminView } from './components/views/AdminView'
import { apiService } from './services/api'

function App() {
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [showApiStatus, setShowApiStatus] = useState(false)
  const [activeView, setActiveView] = useState<'llamados' | 'registrar-usuario' | 'resolver-nombres' | 'admin'>('llamados')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const checkApiHealth = async () => {
    try {
      await apiService.getHealth();
      setApiStatus('✅ API conectada');
    } catch {
      setApiStatus('❌ Error en la API');
    }
    setShowApiStatus(true)
    setTimeout(() => setShowApiStatus(false), 3000)
  }

  useEffect(() => {
    checkApiHealth()
  }, [])

  const handleCallCreated = (callId: string) => {
    // Manejar cuando se crea un nuevo llamado
    console.log('Nuevo llamado creado:', callId);
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'llamados':
        return <LlamadosView onCallCreated={handleCallCreated} />;
      case 'registrar-usuario':
        return <RegistrarUsuarioView />;
      case 'resolver-nombres':
        return <ResolverView />;
      case 'admin':
        return <AdminView />;
      default:
        return <LlamadosView onCallCreated={handleCallCreated} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      {/* Navbar */}
      <Navbar 
        onCheckApiHealth={checkApiHealth} 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div>
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* API Status */}
      {showApiStatus && (
        <div className="api-status">
          {apiStatus}
        </div>
      )}
    </div>
  )
}

export default App
