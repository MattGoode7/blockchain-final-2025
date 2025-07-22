// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./FIFSRegistrar.sol";

/**
 * Un registrar que maneja subdominios de usuarios.
 * Hereda toda la funcionalidad de FIFSRegistrar.
 */
contract UsuariosRegistrar is FIFSRegistrar {
    /**
     * Constructor.
     * @param ensAddr La dirección del registro ENS.
     * @param node El nodo que este registrar administra.
     */
    constructor(ENS ensAddr, bytes32 node) FIFSRegistrar(ensAddr, node) {}
} 