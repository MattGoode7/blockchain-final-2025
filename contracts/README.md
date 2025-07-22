# Sistema de Llamados a Propuestas con ENS

Este proyecto implementa un sistema completo de **Llamados a Propuestas (Call for Proposals)** con integración de **Ethereum Name Service (ENS)** para la gestión de dominios y subdominios.

## 📋 Contratos Principales

### 🏗 CFPFactory.sol
**Factoría para crear y administrar llamados a propuestas**

- **Funcionalidad principal**: Crea instancias del contrato `CFP` y administra cuentas autorizadas
- **Gestión de autorizaciones**: Sistema de registro, autorización y desautorización de cuentas
- **Integración ENS**: Funciones `createWithENS()` y `createForWithENS()` para registrar automáticamente dominios
- **Eventos**: `CFPCreated`, `AccountRegistered`, `AccountAuthorized`, `AccountUnauthorized`

**Funciones principales**:
- `create(bytes32 callId, uint timestamp)` - Crear llamado básico
- `createWithENS(bytes32 callId, uint timestamp)` - Crear llamado con registro ENS
- `register()` - Registrarse para crear llamados
- `authorize(address creator)` - Autorizar cuenta (solo owner)
- `unauthorize(address creator)` - Desautorizar cuenta (solo owner)

### 📬 CFP.sol
**Contrato individual que representa un llamado específico**

- **Identificador único**: Cada llamado tiene un `callId` único
- **Fecha de cierre**: `closingTime` que determina cuándo se cierra la recepción
- **Gestión de propuestas**: Registro de propuestas con hash de documentos
- **Control de acceso**: Solo el creador puede registrar propuestas en nombre de otros

**Estructura de datos**:
```solidity
struct ProposalData {
    address sender;
    uint256 blockNumber;
    uint256 timestamp;
}
```

**Funciones principales**:
- `registerProposal(bytes32 proposal)` - Registrar propuesta propia
- `registerProposalFor(bytes32 proposal, address sender)` - Registrar propuesta para otro (solo creador)
- `proposalData(bytes32 proposal)` - Obtener datos de propuesta
- `proposalCount()` - Cantidad total de propuestas

## 🌐 Implementación ENS

### Arquitectura ENS
El sistema implementa una jerarquía de dominios ENS completa:

```
cfp (TLD)
├── llamados.cfp
│   └── [callId].llamados.cfp
└── usuarios.cfp
    └── [address].usuarios.cfp
```

### Contratos ENS Principales

#### 📋 ENSRegistry.sol
**Registro principal de ENS**
- Gestiona la propiedad de nodos y subnodos
- Controla resolvers y TTL
- Emite eventos para cambios de propiedad

#### 🔄 FIFSRegistrar.sol
**Registrador First-In-First-Served**
- Permite registro de subdominios al primer solicitante
- Base para `LlamadosRegistrar` y `UsuariosRegistrar`
- Control de acceso mediante `only_owner` modifier

#### 📞 LlamadosRegistrar.sol
**Registrador especializado para llamados**
- Hereda de `FIFSRegistrar`
- Gestiona subdominios `*.llamados.cfp`
- Integrado con `CFPFactory` para registro automático

#### 👥 UsuariosRegistrar.sol
**Registrador especializado para usuarios**
- Hereda de `FIFSRegistrar`
- Gestiona subdominios `*.usuarios.cfp`
- Permite registro de direcciones de usuario

### Resolvers y Profiles

#### 🔧 PublicResolver.sol
**Resolver público para ENS**
- Resuelve direcciones, nombres, contenido y metadatos
- Soporte para múltiples tipos de registros
- Integración con profiles especializados

#### 📦 Profiles (Resolvers Especializados)
- **AddrResolver.sol**: Resolución de direcciones
- **NameResolver.sol**: Resolución de nombres
- **TextResolver.sol**: Resolución de texto
- **ContentHashResolver.sol**: Resolución de contenido
- **PubkeyResolver.sol**: Resolución de claves públicas
- **ABIResolver.sol**: Resolución de ABI
- **InterfaceResolver.sol**: Resolución de interfaces

### 🔄 ReverseRegistrar.sol
**Registro inverso para direcciones**
- Permite asociar nombres a direcciones
- Dominio `addr.reverse` para resolución inversa
- Integración con `DefaultReverseResolver`

## 🚀 Migración y Despliegue

### Requisitos Previos

```bash
# Instalar dependencias
npm install

# Instalar Truffle globalmente (opcional)
npm install -g truffle
```

### Despliegue Completo

El despliegue realizado se asume que se hace en Ganache, con una instancia local del mismo en ejecucion. 

```bash
# Compilar contratos
npx truffle compile

# Desplegar en red local (Ganache)
npx truffle migrate --reset

# Desplegar en red específica
npx truffle migrate --network <network_name>
```

### Orden de Migraciones

1. **1_initial_migration.js**: Migración inicial de Truffle
2. **2_cfp_migration.js**: Despliegue de `CFPFactory`
3. **3_ens_migration.js**: Despliegue completo del sistema ENS

### Variables de Entorno

Durante la migración, se mostrarán las direcciones de los contratos que deben copiarse al archivo `.env` de la API:

```bash
# Ejemplo de salida de migración
=== COPIA LAS SIGUIENTES DIRECCIONES EN TU .ENV DE LA API ===
CFP_FACTORY_ADDRESS=0x...
ENS_REGISTRY_ADDRESS=0x...
PUBLIC_RESOLVER_ADDRESS=0x...
REVERSE_REGISTRAR_ADDRESS=0x...
LLAMADOS_REGISTRAR_ADDRESS=0x...
USUARIOS_REGISTRAR_ADDRESS=0x...
=== FIN DE DIRECCIONES PARA .ENV ===
```

### Configuración del .env (ejemplo)

```env
# Contratos principales
CFP_FACTORY_ADDRESS=0x...

# Sistema ENS
ENS_REGISTRY_ADDRESS=0x...
PUBLIC_RESOLVER_ADDRESS=0x...
REVERSE_REGISTRAR_ADDRESS=0x...
LLAMADOS_REGISTRAR_ADDRESS=0x...
USUARIOS_REGISTRAR_ADDRESS=0x...

# Configuración de red
NETWORK_ID=1337
RPC_URL=http://127.0.0.1:8545
```

## 🧪 Testing

```bash
# Ejecutar tests
npx truffle test

# Ejecutar test específico
npx truffle test test/testCFP.js
```

## 📁 Estructura de Archivos

```
contracts/
├── contracts/
│   ├── CFP.sol                    # Contrato principal de llamados
│   ├── CFPFactory.sol             # Factoría de llamados
│   ├── ENS.sol                    # Interface ENS
│   ├── ENSRegistry.sol            # Registro ENS
│   ├── FIFSRegistrar.sol          # Registrador base
│   ├── LlamadosRegistrar.sol      # Registrador de llamados
│   ├── UsuariosRegistrar.sol      # Registrador de usuarios
│   ├── PublicResolver.sol         # Resolver público
│   ├── ReverseRegistrar.sol       # Registro inverso
│   ├── DefaultReverseResolver.sol # Resolver inverso
│   ├── ResolverBase.sol           # Base para resolvers
│   ├── profiles/                  # Resolvers especializados
│   │   ├── AddrResolver.sol
│   │   ├── NameResolver.sol
│   │   ├── TextResolver.sol
│   │   ├── ContentHashResolver.sol
│   │   ├── PubkeyResolver.sol
│   │   ├── ABIResolver.sol
│   │   └── InterfaceResolver.sol
│   └── Migrations.sol             # Migración Truffle
├── migrations/
│   ├── 1_initial_migration.js    # Migración inicial
│   ├── 2_cfp_migration.js        # Despliegue CFP
│   └── 3_ens_migration.js        # Despliegue ENS
├── test/                          # Tests
├── build/                         # Artefactos compilados
├── package.json                   # Dependencias
└── truffle-config.js             # Configuración Truffle
```

## 📝 Notas Importantes

1. **Orden de migración**: Las migraciones deben ejecutarse en orden secuencial
2. **Variables de entorno**: Copiar las direcciones mostradas en el .env de la API
3. **Red local**: Usar Ganache o similar para desarrollo