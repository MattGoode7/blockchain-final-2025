# Trabajo Práctico Final - Sistema de Llamados a Propuestas con ENS

Este proyecto implementa un sistema completo de **gestión de llamados a presentación de propuestas** con integración de **Ethereum Name Service (ENS)**. El sistema permite la creación, gestión y participación en llamados a propuestas de forma descentralizada, con identidades humanas mediante nombres ENS.

## 📋 Descripción General

El sistema está compuesto por tres componentes principales que trabajan en conjunto:

### 🏗️ **Smart Contracts** (`/contracts`)
- **CFP**: Contrato individual para cada llamado a propuestas
- **CFPFactory**: Factoría para crear y administrar llamados
- **ENS**: Sistema completo de nombres (Registry, Registrars, Resolvers)
- **Dominios**: `llamados.cfp` y `usuarios.cfp` para identidades humanas

### 🔌 **API REST** (`/api`)
- **NestJS**: Backend con endpoints para gestión de llamados y propuestas
- **Web3 Integration**: Conexión con blockchain y contratos
- **ENS Management**: Resolución y registro de nombres
- **Authorization**: Sistema de permisos y autorizaciones

### 🌐 **Interface Web** (`/ui`)
- **React + TypeScript**: Frontend moderno y responsive
- **MetaMask Integration**: Conexión directa con blockchain
- **ENS Resolution**: Visualización de nombres en lugar de direcciones
- **Real-time Updates**: Actualizaciones en tiempo real

## 🛠️ Herramientas Utilizadas

### **Blockchain & Smart Contracts**
- **Ganache**: Red blockchain local para desarrollo
- **Truffle**: Framework para desarrollo, testing y despliegue de contratos
- **Solidity**: Lenguaje de programación para smart contracts
- **Ethers.js**: Biblioteca para interacción con blockchain

### **Backend & API**
- **Node.js**: Runtime de JavaScript
- **NestJS**: Framework para construcción de aplicaciones escalables
- **TypeScript**: Tipado estático para mayor robustez
- **TypeChain**: Generación automática de tipos desde contratos

### **Frontend & UI**
- **React 19**: Biblioteca para interfaces de usuario
- **Vite**: Build tool y dev server de alta velocidad
- **Tailwind CSS**: Framework de estilos utility-first
- **MetaMask**: Wallet para interacción con blockchain

## 🚀 Orden de Despliegue

### 1️⃣ **Preparación del Entorno**

La carpeta raíz principal será la misma que contiene los tres elementos principales del proyecto, en este caso la carpeta Final. A partir de ella trabajaremos con el resto.

El orden para poder utilizar y levantar correctamente este proyecto es el siguiente:

1. Despliegue y migración de Contratos en la carpeta /contracts
2. Configuración y encendido de la API en NestJS en la carpeta /api
3. Configuración y encendido de la UI en React en la carpeta /ui

### 2️⃣ **Despliegue de Contratos**

Las instrucciones correspondientes para la migración y despliegue de los contratos se puede encontrar en el README la carpeta /contracts.

### 3️⃣ **Configuración y Despliegue de la API**

Las instrucciones correspondientes para la configuración y encendido de la API en NESTJS se puede encontrar en el README la carpeta /api.

### 4️⃣ **Configuración y Despliegue de la UI**

Las instrucciones correspondientes para la configuración y encendido de la UI en REACT se puede encontrar en el README la carpeta /ui.

## 🔧 Elementos Adicionales Necesarios

### **MetaMask**
1. Instalar MetaMask en el navegador
2. Conectar a red local (Ganache)
3. Importar cuenta con clave privada de Ganache
4. Configurar red con Chain ID: 1337

### **Ganache**
1. Ejecutar Ganache en puerto 7545
2. Verificar que esté generando bloques
3. Copiar mnemónico para configuración

## 📋 Funcionalidades Implementadas

### **Funcionalidades Mínimas**
- ✅ Listar llamados por creador
- ✅ Presentar propuestas anónimas
- ✅ Verificar registro de propuestas
- ✅ Registro para crear llamados (con MetaMask)
- ✅ Presentar propuestas asociadas a cuenta (con MetaMask)
- ✅ Listar pedidos de registro (owner)
- ✅ Autorizar pedidos de registro (owner)
- ✅ Crear llamados (usuarios registrados)

### **Integración ENS**
- ✅ **Registry**: Contrato principal de ENS
- ✅ **Registrars**: FIFSRegistrar para dominios
- ✅ **Resolvers**: PublicResolver con EIPs 137, 165, 181, 634
- ✅ **Dominios**: `llamados.cfp` y `usuarios.cfp`
- ✅ **Resolución Reversa**: `addr.reverse`
- ✅ **Interface**: Reemplazo de direcciones por nombres ENS

### **Funcionalidades Adicionales**
- ✅ Registro de nombres de usuario en `usuarios.cfp`
- ✅ Registro automático de llamados en `llamados.cfp`
- ✅ Descripción de llamados en registros de tipo `text`
- ✅ Visualización de nombres en lugar de direcciones
- ✅ Resolución inversa de direcciones

## 📁 Estructura del Proyecto

```
blockchain-final-2025/
├── contracts/                 # Smart Contracts (Truffle)
│   ├── contracts/            # Contratos Solidity
│   ├── migrations/           # Scripts de migración
│   ├── test/                 # Tests de contratos
│   └── README.md            # Documentación de contratos
├── api/                      # API REST (NestJS)
│   ├── src/                 # Código fuente
│   ├── test/                # Tests de API
│   └── README.md           # Documentación de API
├── ui/                       # Interface Web (React)
│   ├── src/                 # Código fuente
│   ├── public/              # Archivos estáticos
│   └── README.md           # Documentación de UI
└── README.md                # Este archivo
```

## 🐛 Troubleshooting

### **Error: "Contract not found"**
- Verificar que Ganache esté ejecutándose
- Confirmar que contratos estén desplegados
- Verificar direcciones en `.env`

### **Error: "MetaMask not connected"**
- Verificar que MetaMask esté instalado
- Confirmar conexión a red local (Chain ID: 1337)
- Verificar que cuenta esté importada en MetaMask

### **Error: "API connection failed"**
- Verificar que API esté ejecutándose en puerto 3000
- Confirmar configuración en `ui/src/config/api.ts`

### **Error: "TypeChain types not found"**
- Ejecutar `npm run typechain` en ambos directorios
- Verificar que contratos estén compilados

## 📚 Documentación Adicional

- **Contratos**: Ver `contracts/README.md`
- **API**: Ver `api/README.md`
- **UI**: Ver `ui/README.md`

## 🎯 Criterios de Evaluación

Este proyecto satisface todos los criterios del trabajo práctico final:

- ✅ **Smart Contracts**: Implementación completa con Truffle
- ✅ **API REST**: NestJS con endpoints documentados
- ✅ **Interface Web**: React con MetaMask integration
- ✅ **ENS Integration**: Sistema completo de nombres
- ✅ **Funcionalidades Mínimas**: Todas implementadas
- ✅ **Documentación**: READMEs completos en cada componente
- ✅ **Testing**: Casos de prueba incluidos 