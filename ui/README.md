# UI - Sistema de Llamados a Propuestas

Interfaz de usuario desarrollada en **React + TypeScript + Vite** que proporciona una interfaz web completa para interactuar con el sistema de llamados a propuestas y ENS (Ethereum Name Service).

## 🏗️ Arquitectura de Componentes

### 📦 **App.tsx** (Componente Principal)
**Archivo**: `src/App.tsx`
- **Funcionalidad**: Componente raíz que gestiona el estado global de la aplicación
- **Navegación**: Control de vistas activas y sidebar
- **Estado**: API status, vista activa, sidebar open/close
- **Vistas**: Llamados, Registrar Usuario, Resolver Nombres, Admin

### 🔐 **Componentes de Autorización**

#### **AdminPanel.tsx**
- **Funcionalidad**: Panel de administración para el owner del factory
- **Características**: Autorizar/desautorizar cuentas, gestionar registros pendientes
- **Integración**: Conecta con CFPFactory para operaciones administrativas

#### **FactoryOwnerPanel.tsx**
- **Funcionalidad**: Panel específico para el dueño de la factoría
- **Características**: Gestión de autorizaciones, vista de estadísticas
- **Permisos**: Solo visible para cuentas con rol de owner

### 📞 **Componentes de Llamados**

#### **CallList.tsx**
- **Funcionalidad**: Lista y gestión de llamados a propuestas
- **Características**: Crear llamados, listar existentes, filtrar por estado
- **Integración**: Conecta con CFPFactory y API para operaciones CRUD

#### **CreateCFPWithENS.tsx**
- **Funcionalidad**: Creación de llamados con registro ENS automático
- **Características**: Formulario completo, validación, registro de dominio
- **ENS**: Registro automático del dominio del llamado en ENS

### 📋 **Componentes de Propuestas**

#### **ProposalRegistration.tsx**
- **Funcionalidad**: Registro de propuestas en llamados específicos
- **Características**: Formulario de propuesta, validación de fechas
- **Integración**: Conecta con contratos CFP para registro

#### **ProposalVerification.tsx**
- **Funcionalidad**: Verificación y validación de propuestas registradas
- **Características**: Lista de propuestas, verificación de autenticidad
- **Validación**: Verificación de hashes y timestamps

#### **MetaMaskProposalRegistration.tsx**
- **Funcionalidad**: Registro de propuestas con firma de MetaMask
- **Características**: Firma digital, verificación de identidad
- **Seguridad**: Validación de firma antes del registro

### 🌐 **Componentes ENS**

#### **ENSResolver.tsx**
- **Funcionalidad**: Resolución de nombres y direcciones ENS
- **Características**: Búsqueda de nombres, resolución inversa
- **Integración**: Conecta con contratos ENS para resolución

#### **ENSUserRegistration.tsx**
- **Funcionalidad**: Registro de usuarios en el sistema ENS
- **Características**: Formulario de registro, validación de disponibilidad
- **Dominios**: Registro en subdominio `usuarios.cfp`

#### **UserRegistration.tsx**
- **Funcionalidad**: Registro general de usuarios en el sistema
- **Características**: Formulario completo, validación de datos
- **Integración**: Conecta con múltiples servicios (ENS, Factory)

### 🧭 **Componentes de Navegación**

#### **Navbar.tsx**
- **Funcionalidad**: Barra de navegación principal
- **Características**: Estado de API, conexión MetaMask, menú hamburguesa
- **Integración**: Health check de API, estado de conexión

#### **Sidebar.tsx**
- **Funcionalidad**: Menú lateral de navegación
- **Características**: Navegación entre vistas, estado activo
- **Responsive**: Adaptable a diferentes tamaños de pantalla

#### **MenuButton.tsx**
- **Funcionalidad**: Botón de menú hamburguesa
- **Características**: Toggle del sidebar, iconos animados

### 📱 **Componentes de Vistas**

#### **LlamadosView.tsx**
- **Funcionalidad**: Vista principal de gestión de llamados
- **Características**: Lista de llamados, creación, filtros
- **Integración**: Combina CallList y CreateCFPWithENS

#### **AdminView.tsx**
- **Funcionalidad**: Vista de administración del sistema
- **Características**: Paneles de admin, estadísticas
- **Permisos**: Solo para usuarios autorizados

#### **RegistrarUsuarioView.tsx**
- **Funcionalidad**: Vista de registro de usuarios
- **Características**: Formularios de registro, validación
- **Integración**: Conecta con UserRegistration

#### **ResolverView.tsx**
- **Funcionalidad**: Vista de resolución ENS
- **Características**: Búsqueda y resolución de nombres
- **Integración**: Conecta con ENSResolver

## 🎣 Hooks Personalizados

### 🔗 **useMetaMask.ts**
**Archivo**: `src/hooks/useMetaMask.ts`

**Funcionalidad**: Gestión completa del estado de MetaMask
- **Estado**: Conexión, dirección, red, permisos
- **Métodos**: `connect()`, `disconnect()`, `checkConnection()`
- **Validación**: Verificación de red, autorizaciones

**Interfaz**:
```typescript
interface MetaMaskState {
  isConnected: boolean;
  address: string | null;
  isNetworkOk: boolean;
  isOwner: boolean;
  isAuthorized: boolean;
  error: string | null;
}
```

### 🌐 **useENSResolution.ts**
**Archivo**: `src/hooks/useENSResolution.ts`

**Funcionalidad**: Resolución de nombres ENS
- **Métodos**: Resolución de nombres, direcciones, verificación
- **Caché**: Almacenamiento local de resoluciones
- **Validación**: Verificación de formatos ENS

## 🔧 Servicios

### 🌐 **EthereumService**
**Archivo**: `src/services/ethereumService.ts`

**Funcionalidad**: Servicio principal de interacción con blockchain
- **Conexión**: MetaMask, provider, signer
- **Contratos**: Factory, CFP, ENS
- **Transacciones**: Firma, envío, verificación

### 📞 **CallService**
**Archivo**: `src/services/callService.ts`

**Funcionalidad**: Gestión de llamados a propuestas
- **CRUD**: Crear, leer, actualizar llamados
- **API**: Integración con endpoints de llamados
- **Validación**: Verificación de datos

### 🌐 **ENSService**
**Archivo**: `src/services/ensService.ts`

**Funcionalidad**: Gestión completa del sistema ENS
- **Registro**: Dominios, subdominios, usuarios
- **Resolución**: Nombres, direcciones, contenido
- **Validación**: Disponibilidad, formatos

### 🔧 **FactoryService**
**Archivo**: `src/services/factoryService.ts`

**Funcionalidad**: Interacción con CFPFactory
- **Autorización**: Registro, autorización de cuentas
- **Creación**: Llamados con y sin ENS
- **Gestión**: Listas de creadores, pendientes

### 📡 **APIService**
**Archivo**: `src/services/api.ts`

**Funcionalidad**: Cliente HTTP para la API
- **Configuración**: Base URL, headers, interceptors
- **Métodos**: GET, POST, PUT, DELETE
- **Manejo**: Errores, timeouts, retry

### 🔐 **AuthService**
**Archivo**: `src/services/authService.ts`

**Funcionalidad**: Gestión de autenticación
- **Tokens**: JWT, refresh tokens
- **Sesión**: Estado de usuario, permisos
- **Validación**: Verificación de credenciales

## ⚙️ Configuraciones

### 📁 **Config API**
**Archivo**: `src/config/api.ts`

Configuración centralizada de endpoints:

```typescript
export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Calls
  CALLS: '/calls',
  CREATE_CALL: '/create',
  
  // Proposals
  REGISTER_PROPOSAL: '/register-proposal',
  
  // Authorization
  REGISTER: '/register',
  AUTHORIZE: '/authorize',
  
  // ENS
  ENS_REGISTER_USER: '/ens/register-user',
  ENS_RESOLVE_NAME: '/ens/resolve-name',
  // ... más endpoints
};
```

## 🔄 TypeChain - Generación de Tipos

### Generar Tipos desde Contratos Compilados

```bash
# Generar tipos TypeScript desde los ABIs de los contratos
npm run typechain
```

**Comando**: `typechain --target ethers-v6 --out-dir src/types ../contracts/build/contracts/*.json`

**Proceso**:
1. Lee los archivos JSON de los contratos compilados
2. Genera interfaces TypeScript en `src/types/`
3. Proporciona tipado fuerte para interacciones con contratos

**Archivos generados**:
- `CFP.ts` - Tipos para contrato CFP
- `CFPFactory.ts` - Tipos para contrato CFPFactory
- `ENSRegistry.ts` - Tipos para registro ENS
- `PublicResolver.ts` - Tipos para resolver público
- Y otros contratos...

## 🚀 Despliegue de la Aplicación

### 📋 Requisitos Previos

```bash
# Instalar dependencias
npm install

# Generar tipos de contratos (después de compilar contratos)
npm run typechain
```

### 🔧 Configuración

```bash
# Verificar que la API esté ejecutándose en http://localhost:3000
# Verificar que Ganache esté ejecutándose
# Verificar que MetaMask esté configurado para la red local
```

### 🏃‍♂️ Comandos de Ejecución

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### 🌐 Acceso a la Aplicación

- **Desarrollo**: `http://localhost:5173`
- **Preview**: `http://localhost:4173` (después de build)

## 📁 Estructura de Archivos

```
ui/src/
├── App.tsx                    # Componente principal
├── main.tsx                   # Punto de entrada
├── index.css                  # Estilos globales
├── vite-env.d.ts             # Tipos de Vite
├── config/
│   └── api.ts                # Configuración de API
├── components/
│   ├── views/                # Vistas principales
│   │   ├── LlamadosView.tsx
│   │   ├── AdminView.tsx
│   │   ├── RegistrarUsuarioView.tsx
│   │   └── ResolverView.tsx
│   ├── navigation/           # Componentes de navegación
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── MenuButton.tsx
│   ├── CreateCFPWithENS.tsx  # Creación de llamados
│   ├── CallList.tsx          # Lista de llamados
│   ├── AdminPanel.tsx        # Panel de administración
│   ├── FactoryOwnerPanel.tsx # Panel de owner
│   ├── ENSResolver.tsx       # Resolución ENS
│   ├── ENSUserRegistration.tsx # Registro ENS
│   ├── UserRegistration.tsx  # Registro de usuarios
│   ├── ProposalRegistration.tsx # Registro de propuestas
│   ├── ProposalVerification.tsx # Verificación de propuestas
│   └── MetaMaskConnect.tsx   # Conexión MetaMask
├── hooks/                    # Hooks personalizados
│   ├── useMetaMask.ts
│   └── useENSResolution.ts
├── services/                 # Servicios
│   ├── ethereumService.ts
│   ├── callService.ts
│   ├── ensService.ts
│   ├── factoryService.ts
│   ├── api.ts
│   ├── authService.ts
│   └── ...
├── types/                    # Tipos generados por TypeChain
│   ├── factories/
│   ├── CFP.ts
│   ├── CFPFactory.ts
│   └── ...
└── utils/                    # Utilidades
    └── hash.ts
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno Requeridas

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de la API | `http://localhost:3000` |
| `VITE_NETWORK_ID` | ID de la red blockchain | `1337` (Ganache) |
| `VITE_CHAIN_ID` | Chain ID para MetaMask | `0x539` (1337) |

### Flujo de Configuración

1. **Desplegar contratos** en Ganache
2. **Generar tipos** con `npm run typechain`
3. **Configurar MetaMask** para red local
4. **Iniciar API** en puerto 3000
5. **Iniciar UI** con `npm run dev`

## 🎨 Tecnologías Utilizadas

- **React 19**: Framework de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **Ethers.js**: Interacción con blockchain
- **Axios**: Cliente HTTP
- **Headless UI**: Componentes accesibles
- **Heroicons**: Iconografía

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Ejecutar `npm install`
- Verificar que TypeChain generó los tipos

### Error: "MetaMask not found"
- Verificar que MetaMask esté instalado
- Confirmar que esté conectado a la red correcta

### Error: "API connection failed"
- Verificar que la API esté ejecutándose en puerto 3000
- Confirmar configuración en `src/config/api.ts`

### Error: "Contract not found"
- Verificar que contratos estén desplegados en Ganache
- Confirmar direcciones en la API

### Error: "Network mismatch"
- Verificar Chain ID en MetaMask (1337 para Ganache)
- Confirmar configuración de red en `ethereumService.ts` 