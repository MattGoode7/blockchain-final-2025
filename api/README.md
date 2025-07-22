# API - Sistema de Llamados a Propuestas

API REST desarrollada en **NestJS** que proporciona endpoints para interactuar con el sistema de llamados a propuestas y ENS (Ethereum Name Service).

## 🏗️ Arquitectura de Módulos

### 📦 **AppModule** (Módulo Principal)
**Archivo**: `src/app.module.ts`
- Configuración global de la aplicación
- Importa todos los módulos especializados
- Configuración de CORS para el frontend
- Carga de configuraciones de contratos

### 🔐 **AuthorizationModule**
**Archivo**: `src/authorization/`
- **Funcionalidad**: Gestión de autorizaciones para crear llamados
- **Endpoints**: Registro de cuentas, autorización/desautorización
- **Servicios**: `AuthorizationService` - Interacción con CFPFactory
- **DTOs**: `RegisterDto` - Validación de datos de registro

### 📞 **CallsModule**
**Archivo**: `src/calls/`
- **Funcionalidad**: Gestión completa de llamados a propuestas
- **Endpoints**: Crear, listar, obtener detalles de llamados
- **Servicios**: `CallsService` - Interacción con contratos CFP y CFPFactory
- **DTOs**: `CreateCallDto` - Validación de datos de llamados

### 📋 **ProposalsModule**
**Archivo**: `src/proposals/`
- **Funcionalidad**: Gestión de propuestas dentro de llamados
- **Endpoints**: Registrar propuestas, listar propuestas por llamado
- **Servicios**: `ProposalsService` - Interacción con contratos CFP
- **DTOs**: `RegisterProposalDto` - Validación de datos de propuestas

### 🌐 **Web3Module**
**Archivo**: `src/web3/`
- **Funcionalidad**: Conexión y gestión de la blockchain
- **Servicios**: `Web3Service` - Proveedor Web3, wallet, transacciones
- **Configuración**: Conexión a Ganache, gestión de mnemónicos

### 📜 **ContractsModule**
**Archivo**: `src/contracts/`
- **Funcionalidad**: Interacción directa con contratos inteligentes
- **Servicios**: 
  - `ContractsService` - Operaciones básicas de contratos
  - `ENSService` - Gestión completa del sistema ENS
- **Controllers**: 
  - `ContractsController` - Endpoints de contratos
  - `ENSController` - Endpoints de ENS (registro, resolución, etc.)

## ⚙️ Configuraciones

### 📁 **Carpeta Config**
**Archivo**: `src/config/contracts.config.ts`

Configuración centralizada para las direcciones de contratos:

```typescript
export interface ContractsConfig {
  cfpFactoryAddress: string;
  ensRegistryAddress: string;
  publicResolverAddress: string;
  reverseRegistrarAddress: string;
  llamadosRegistrarAddress: string;
  usuariosRegistrarAddress: string;
}
```

### 🔧 **Variables de Entorno**

Crear archivo `.env` basado en `.env.example`:

```env
# Configuración de la red blockchain
NETWORK_ID=5777

# Direcciones de los contratos desplegados
CFP_FACTORY_ADDRESS=0x6192801eCB80B149e97a67fa566Cf2521347cF91
ENS_REGISTRY_ADDRESS=0xDee9795dcDef85ed924AB3Cca1e08cc27f294C56
PUBLIC_RESOLVER_ADDRESS=0xdbDf995c25c9c76e3f27f42a8C4E86C376644be6
REVERSE_REGISTRAR_ADDRESS=0x22109c041F8ab4b482Ffb1dbDF8B51025F75F735
LLAMADOS_REGISTRAR_ADDRESS=0x72FCF59a3D6d53B14884854f9fae8A5c4130EFC7
USUARIOS_REGISTRAR_ADDRESS=0xb925FDDF500Cc09B70BBB7a0448Ae812834Ddeca

# URL de conexión a Ganache
# Ejemplo: http://127.0.0.1:7545
GANACHE_URL=http://127.0.0.1:7545

# Puerto donde corre la API
PORT=3000

# URL del Frontend
FRONTEND_URL=http://localhost:5173

# Frase mnemónica de la cuenta que desplegó el contrato
# Debe ser una frase de 12 palabras separadas por espacios
# Ejemplo: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
MNEMONIC="syrup estate banana afraid bar gallery evil capable daring paper famous doctor"
```

## 🔄 TypeChain - Generación de Tipos

### Generar Tipos desde Contratos Compilados

```bash
# Generar tipos TypeScript desde los ABIs de los contratos
npm run typechain
```

**Comando**: `typechain --target ethers-v6 --out-dir src/contracts/types ../contracts/build/contracts/*.json`

**Proceso**:
1. Lee los archivos JSON de los contratos compilados
2. Genera interfaces TypeScript en `src/contracts/types/`
3. Proporciona tipado fuerte para interacciones con contratos

**Archivos generados**:
- `CFP.ts` - Tipos para contrato CFP
- `CFPFactory.ts` - Tipos para contrato CFPFactory
- `ENSRegistry.ts` - Tipos para registro ENS
- `PublicResolver.ts` - Tipos para resolver público
- Y otros contratos...

## 🚀 Ejecución de la Aplicación

### 📋 Requisitos Previos

```bash
# Instalar dependencias
npm install

# Generar tipos de contratos (después de compilar contratos)
npm run typechain
```

### 🔧 Configuración

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
# Completar direcciones de contratos y configuración
```

### 🏃‍♂️ Comandos de Ejecución

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run start:prod

# Debug
npm run start:debug

# Build
npm run build
```

### 🌐 Endpoints Principales

**Health Check**:
- `GET /health` - Estado de la API

**Autorización**:
- `POST /authorization/register` - Registro de cuenta
- `POST /authorization/authorize` - Autorizar cuenta
- `POST /authorization/unauthorize` - Desautorizar cuenta

**Llamados**:
- `POST /calls` - Crear nuevo llamado
- `GET /calls` - Listar llamados
- `GET /calls/:callId` - Obtener llamado específico

**Propuestas**:
- `POST /proposals` - Registrar propuesta
- `GET /proposals/:callId` - Listar propuestas de un llamado

**ENS**:
- `POST /ens/register` - Registrar dominio ENS
- `GET /ens/resolve/:name` - Resolver nombre ENS
- `GET /ens/reverse/:address` - Resolución inversa

## 📁 Estructura de Archivos

```
api/src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Punto de entrada
├── health.controller.ts        # Health check
├── config/
│   └── contracts.config.ts    # Configuración de contratos
├── authorization/              # Módulo de autorización
│   ├── authorization.module.ts
│   ├── authorization.controller.ts
│   ├── authorization.service.ts
│   └── dto/
├── calls/                     # Módulo de llamados
│   ├── calls.module.ts
│   ├── calls.controller.ts
│   ├── calls.service.ts
│   └── dto/
├── proposals/                 # Módulo de propuestas
│   ├── proposals.module.ts
│   ├── proposals.controller.ts
│   ├── proposals.service.ts
│   └── dto/
├── web3/                      # Módulo Web3
│   ├── web3.module.ts
│   └── web3.service.ts
├── contracts/                 # Módulo de contratos
│   ├── contracts.module.ts
│   ├── contracts.controller.ts
│   ├── contracts.service.ts
│   ├── ens.controller.ts
│   ├── ens.service.ts
│   └── types/                 # Tipos generados por TypeChain
└── utils/                     # Utilidades
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NETWORK_ID` | ID de la red blockchain | `5777` (Ganache) |
| `CFP_FACTORY_ADDRESS` | Dirección del contrato CFPFactory | `0x...` |
| `ENS_REGISTRY_ADDRESS` | Dirección del registro ENS | `0x...` |
| `PUBLIC_RESOLVER_ADDRESS` | Dirección del resolver público | `0x...` |
| `REVERSE_REGISTRAR_ADDRESS` | Dirección del registro inverso | `0x...` |
| `LLAMADOS_REGISTRAR_ADDRESS` | Dirección del registrador de llamados | `0x...` |
| `USUARIOS_REGISTRAR_ADDRESS` | Dirección del registrador de usuarios | `0x...` |
| `GANACHE_URL` | URL de conexión a Ganache | `http://127.0.0.1:7545` |
| `PORT` | Puerto de la API | `3000` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:5173` |
| `MNEMONIC` | Frase mnemónica de la wallet | `"word1 word2..."` |

### Flujo de Configuración

1. **Desplegar contratos** en Ganache
2. **Copiar direcciones** de la migración al `.env`
3. **Generar tipos** con `npm run typechain`
4. **Iniciar API** con `npm run start:dev`

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Ejecutar `npm install`
- Verificar que TypeChain generó los tipos

### Error: "Invalid mnemonic"
- Verificar formato de 12 palabras separadas por espacios
- Asegurar que la frase es correcta

### Error: "Contract not found"
- Verificar direcciones en `.env`
- Confirmar que contratos están desplegados en Ganache

### Error: "Network connection failed"
- Verificar que Ganache está ejecutándose
- Confirmar URL en `GANACHE_URL`
