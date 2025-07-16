import { useState, useEffect } from 'react'
import { CallList } from './components/CallList'
import {
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import './index.css'
import { MetaMaskConnect } from './components/MetaMaskConnect'
import { AdminPanel } from './components/AdminPanel'
import { UserRegistration } from './components/UserRegistration'
import { CreateCFP } from './components/CreateCFP'
import { useMetamask } from './hooks/useMetaMask'
import { ethereumService } from './services/ethereumService'
import { apiService } from './services/api'

function App() {
  const [, setSelectedCallId] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [showApiStatus, setShowApiStatus] = useState(false)
  const { isConnected, isOwner, isNetworkOk, address } = useMetamask()
  const [isAuthorized, setIsAuthorized] = useState(false)

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

  useEffect(() => {
    const checkAuth = async () => {
      if (isConnected && address) {
        try {
          const authorized = await ethereumService.isAuthorized(address)
          setIsAuthorized(authorized)
        } catch {
          setIsAuthorized(false)
        }
      } else {
        setIsAuthorized(false)
      }
    }
    checkAuth()
  }, [isConnected, address])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      <header className="bg-[#1e293b] shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-primary" />
              <div className="flex items-center space-x-4">
                <img src="/contract.svg" alt="CFP" className="h-10 w-10" />
                <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md opacity-100">
                  Sistema de Propuestas
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserCircleIcon className="h-6 w-6 text-text-light" />
              <span className="text-sm text-text-light">Bienvenido al sistema</span>
              <button
                onClick={checkApiHealth}
                className="ml-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-xs font-semibold shadow border border-primary"
              >
                Probar conexión API
              </button>
              <MetaMaskConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 opacity-100">Gestión de Propuestas Blockchain</h2>
          <p className="text-lg text-text-light text-white max-w-2xl mx-auto">Registra y verifica propuestas de manera segura y transparente. Selecciona un llamado vigente para comenzar el proceso.</p>
        </div>

        {!(isConnected && isNetworkOk) ? (
          <div className="flex justify-center">
            <section className="w-full max-w-4xl">
              <div className="section-header flex items-center text-center space-x-2 mb-4 text-white">
                <DocumentMagnifyingGlassIcon className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold opacity-100 text-white">
                  Llamados Disponibles
                </h2>
              </div>
              <CallList onSelectCall={setSelectedCallId} />
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-min">
            {/* Columna de llamados (ocupa 2 filas en pantallas medianas y grandes) */}
            <div className="md:row-span-2 lg:col-span-2 flex flex-col h-full">
              <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-6 rounded-2xl h-full flex flex-col">
                <div className="section-header flex items-center space-x-2 mb-4">
                  <DocumentMagnifyingGlassIcon className="h-7 w-7 text-primary" />
                  <h2 className="text-2xl font-bold card-title opacity-100">
                    Llamados Disponibles
                  </h2>
                </div>
                <CallList onSelectCall={setSelectedCallId} />
              </section>
            </div>

            {/* Paneles laterales */}
            <div className="flex flex-col gap-8 h-full">
              {isOwner && (
                <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-6 rounded-2xl">
                  <div className="section-header flex items-center space-x-2 mb-4">
                    <DocumentTextIcon className="h-7 w-7 text-primary" />
                    <h2 className="text-2xl font-bold card-title opacity-100">
                      Panel de Administración
                    </h2>
                  </div>
                  <AdminPanel />
                </section>
              )}
              {/* Mostrar el panel de registro solo si NO está autorizado o si es admin */}
              {(!isAuthorized || isOwner) && (
                <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-6 rounded-2xl">
                  <div className="section-header flex items-center space-x-2 mb-4">
                    <UserCircleIcon className="h-7 w-7 text-primary" />
                    <h2 className="text-2xl font-bold card-title opacity-100">
                      Registro de Usuario
                    </h2>
                  </div>
                  <UserRegistration isOwner={isOwner} isAuthorized={isAuthorized} />
                </section>
              )}
              <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-6 rounded-2xl">
                <div className="section-header flex items-center space-x-2 mb-4">
                  <DocumentTextIcon className="h-7 w-7 text-primary" />
                  <h2 className="text-2xl font-bold card-title opacity-100">
                    Crear Nuevo CFP
                  </h2>
                </div>
                <CreateCFP onCallCreated={setSelectedCallId} />
              </section>
            </div>
          </div>
        )}
      </main>

      {showApiStatus && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-primary text-primary px-6 py-3 rounded-xl shadow-lg text-center font-semibold">
          {apiStatus}
        </div>
      )}
    </div>
  )
}

export default App
