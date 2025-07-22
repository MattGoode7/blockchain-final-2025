# Trabajo Práctico 7

El trabajo consiste en implementar dos contratos. El contrato `CFP` implementa un llamado a presentación de propuestas (*Call For Proposals*). Una propuesta está representada por el *hash* de un documento, que es registrada en el contrato antes de la fecha de cierre del llamado.

El contrato `CFPFactory` implementa una factoría que crea instancias del contrato `CFP`.

## Contratos

### `CFP`

#### Tipos de datos

La estructura `ProposalData` representa una propuesta, y almacena la dirección del autor de la propuesta (`sender`), el número de bloque y el `timestamp` en el que la propuesta fue registrada.

```solidity
struct ProposalData {
    address sender;
    uint blockNumber;
    uint timestamp;
}
```

#### Eventos

El evento `ProposalRegistered` se emite al momento de registrarse una propuesta.

```solidity
event ProposalRegistered(bytes32 proposal, address sender, uint blockNumber);
```

#### Constructor

El constructor recibe dos argumentos: un identificador del llamado, del tipo `bytes32`, y un `timestamp` de tipo `uint` que establece el tiempo de cierre de la convocatoria. Si ese tiempo está en el pasado, la acción se revierte con el mensaje "El cierre de la convocatoria no puede estar en el pasado".

#### Funciones informativas

Las funciones especificadas a continuación pueden implementarse en forma explícita, o como consecuencia de la definición de una variable de estado pública con el nombre adecuado.

##### `proposalData(bytes32 proposal)`

* Devuelve una estructura de tipo `ProposalData`, asociada con la propuesta `proposal`.

##### `proposalCount()`

* Devuelve la cantidad de propuestas presentadas.

##### `proposals(uint index)`

* Devuelve la propuesta que está en la posición `index` de la lista.

##### `closingTime()`

* Devuelve el `timestamp` correspondiente al cierre del llamado.

##### `callId()`

* Devuelve el identificador de este llamado.

##### `creator()`

* Devuelve la dirección del creador de este contrato.

##### `proposalTimestamp(bytes32 proposal)`

* Devuelve el `timestamp` en el que se ha registrado una propuesta. Si la propuesta no está registrada devuelve cero.

#### Transacciones

##### `registerProposal(bytes32 proposal)`

* Permite registrar una propuesta, expresada como un argumento de tipo `bytes32`.
* Registra al emisor del mensaje como emisor de la propuesta.
* Si el timestamp del bloque actual es mayor que el del cierre del llamado, revierte con el error "Convocatoria cerrada".
* Si ya se ha registrado una propuesta igual, revierte con el mensaje "La propuesta ya ha sido registrada".
* Emite el evento `ProposalRegistered`.

##### `registerProposalFor(bytes32 proposal, address sender)`

* Permite registrar una propuesta especificando un emisor.
* Sólo puede ser ejecutada por el creador del llamado. Si no es así, revierte con el mensaje "Solo el creador puede hacer esta llamada".
* Si el timestamp del bloque actual es mayor que el del cierre del llamado, revierte con el error "Convocatoria cerrada".
* Si ya se ha registrado una propuesta igual, revierte con el mensaje "La propuesta ya ha sido registrada"
* Emite el evento `ProposalRegistered`

#### Errores

##### `La propuesta ya ha sido registrada`

Ocurre cuando se intenta registrar una propuesta que ha sido registrada previamente.

##### `El cierre de la convocatoria no puede estar en el pasado`

Ocurre cuando se intenta crear un llamado con fecha de cierre igual o anterior al `timestamp` del bloque actual.

##### `Convocatoria cerrada`

Ocurre cuando se intenta registrar una propuesta luego del cierre de la convocatoria.

##### `Solo el creador puede hacer esta llamada`

Ocurre cuando alguien que no es el creador de la llamada intenta ejecutar una función reservada para el creador.

### `CFPFactory`

#### Tipos de datos

La estructura `CallForProposals` representa un llamado, y almacena la dirección del creador y la dirección del nuevo contrato creado.

```solidity
struct CallForProposals {
    address creator;
    CFP cfp;
}
```

#### Eventos

El evento `CFPCreated` se emite cuando se crea un nuevo contrato.

```solidity
event CFPCreated(address creator, bytes32 callId, CFP cfp);
```

#### Constructor

El constructor no recibe argumentos y simplemente registra al emisor como dueño de la factoría.

#### Funciones informativas

##### `owner()`

* Devuelve la dirección del dueño de la factoría

##### `calls(bytes32 callId)`

* Devuelve una estructura de tipo `CallForProposals` con la información asociada con el argumento `callId`.

##### `creatorsCount()`

* Devuelve la cantidad de cuentas que han creado llamados.

##### `creators(uint index)`

* Devuelve la dirección del creador en la posición `index`.

##### `createdByCount(address creator)`

* Devuelve la cantidad de contratos creados por un cierto creador.

##### `createdBy(address creator, uint index)`

* Devuelve el contrato que se encuentra en la posición `index` de la lista de contratos creados por `creator`.

##### `pendingCount()`

* Devuelve la cantidad de cuentas que se han registrado para crear llamados y que no han sido autorizadas o desautorizadas aún.
* Sólo puede ser invocada por el dueño de la factoría.
* Si es ejecutada por otro usuario, revierte con el mensaje "Solo el creador puede hacer esta llamada"

##### `getPending(uint index)`

* Devuelve la dirección que está en la posición `index` de la lista de pendientes de autorización.
* Sólo puede ser invocada por el dueño de la factoría.
* Si es ejecutada por otro usuario, revierte con el mensaje "Solo el creador puede hacer esta llamada"

##### `getAllPending()`

* Devuelve la lista de todas las direcciones pendientes de autorización.
* Sólo puede ser invocada por el dueño de la factoría.
* Si es ejecutada por otro usuario, revierte con el mensaje "Solo el creador puede hacer esta llamada"

##### `isRegistered(address account)`

* Devuelve verdadero si la cuenta provista como argumento se ha registrado y está pendiente de autorización.

##### `isAuthorized(address account)`

* Devuelve verdadero si la cuenta provista como argumento está autorizada para crear llamados.

#### Transacciones

##### `create(bytes32 callId, uint timestamp) public returns (CFP)`

* Crea un llamado, con un identificador y un tiempo de cierre
* Si ya existe un llamado con ese identificador, revierte con el mensaje de error "El llamado ya existe"
* Si el emisor no está autorizado a crear llamados, revierte con el mensaje "No autorizado"

##### `function createFor(bytes32 callId, uint timestamp, address creator) public returns (CFP)`

* Crea un llamado, estableciendo a `creator` como creador del mismo.
* Sólo puede ser invocada por el dueño de la factoría.
* Se comporta en todos los demás aspectos como `create(bytes32 callId, uint timestamp)`

##### `register()`

* Permite que una cuenta se registre para poder crear llamados.
* El registro queda en estado pendiente hasta que el dueño de la factoría lo autorice.
* Si ya se ha registrado, revierte con el mensaje "Ya se ha registrado"

##### `registerProposal(bytes32 callId, bytes32 proposal)`

* Permite a un usuario registrar una propuesta, para un llamado con identificador `callId`.
* Si el llamado no existe, revierte con el mensaje  "El llamado no existe".
* Registra la propuesta en el llamado asociado con `callId` y pasa como creador la dirección del emisor del mensaje.

##### `authorize(address creator)`

* Autoriza a una cuenta a crear llamados.
* Sólo puede ser ejecutada por el dueño de la factoría.
* En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
* Si la cuenta se ha registrado y está pendiente, la quita de la lista de pendientes.

##### `unauthorize(address creator)`

* Quita la autorización de una cuenta para crear llamados.
* Sólo puede ser ejecutada por el dueño de la factoría.
* En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
* Si la cuenta se ha registrado y está pendiente, la quita de la lista de pendientes.

#### Errores

##### `Solo el creador puede hacer esta llamada`

Ocurre cuando alguien que no es el creador de la llamada intenta ejecutar una función reservada para el creador.

##### `El llamado ya existe`

Ocurre cuando se intenta crear un llamado con el mismo `callId` que uno existente.

##### `El llamado no existe`

Ocurre cuando se intenta registrar una propuesta asociada con un `callId` inexistente.

##### `No autorizado`

Ocurre cuando una cuenta no autorizada intenta crear un llamado.

##### `Ya se ha registrado`

Ocurre cuando una cuenta registrada intenta registrarse nuevamente.

---

# CFP & CFPFactory - Sistema de Llamados a Propuestas en Solidity

Este proyecto implementa dos contratos inteligentes en Solidity para gestionar un sistema de **Llamados a Propuestas (Call for Proposals)**, incluyendo un contrato factory (`CFPFactory`) para crear y administrar múltiples llamados, y un contrato base (`CFP`) que representa cada llamado individual.

## 📄 Descripción de los Contratos

### 🏗 CFPFactory.sol

- Permite registrar cuentas para crear llamados.
- Administra una lista de cuentas pendientes, autorizadas y registradas.
- Crea instancias del contrato `CFP` mediante `create` y `createFor`.
- Guarda y organiza los llamados creados.
- Solo el **dueño del contrato factory** puede autorizar o desautorizar cuentas.

### 📬 CFP.sol

- Representa un llamado específico a propuestas, con un identificador único y una fecha de cierre.
- Permite registrar propuestas antes del cierre.
- Cada propuesta guarda quién la envió y cuándo (block y timestamp).
- Solo el creador del llamado puede registrar propuestas en nombre de otros.

---

## 🚀 Despliegue y Tests con Truffle

### 🛠 Requisitos

- Node.js y NPM instalados
- Truffle

### 📦 Instalación

Clonar este repositorio y ejecutar:

```bash
npm install
```
### ⚙️ Compilar Contratos
```bash
npx truffle compile
```

### 🧪 Ejecutar Tests
```bash
npx truffle test
```