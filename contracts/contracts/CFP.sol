//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CFP {
    // Evento que se emite cuando alguien registra una propuesta
    event ProposalRegistered(
        bytes32 indexed proposal,
        address indexed sender,
        uint256 blockNumber
    );

    // Estructura que representa una propuesta
    struct ProposalData {
        address sender;
        uint256 blockNumber;
        uint256 timestamp;
    }

    // Variables de estado
    mapping(bytes32 => ProposalData) private _proposalsData;
    bytes32[] private _proposals;
    bytes32 private immutable _callId;
    uint256 private immutable _closingTime;
    address private immutable _creator;

    // Modifiers
    modifier onlyCreator() {
        require(
            msg.sender == _creator,
            "Solo el creador puede hacer esta llamada"
        );
        _;
    }

    modifier beforeClosing() {
        require(block.timestamp <= _closingTime, "Convocatoria cerrada");
        _;
    }

    modifier proposalNotRegistered(bytes32 proposal) {
        require(
            _proposalsData[proposal].timestamp == 0,
            "La propuesta ya ha sido registrada"
        );
        _;
    }

    // Devuelve los datos asociados con una propuesta
    function proposalData(
        bytes32 proposal
    ) public view returns (ProposalData memory) {
        return _proposalsData[proposal];
    }

    // Devuelve la propuesta que está en la posición `index` de la lista de propuestas registradas
    function proposals(uint index) public view returns (bytes32) {
        require(index < _proposals.length, "Index out of bounds");
        return _proposals[index];
    }

    // Timestamp del cierre de la recepción de propuestas
    function closingTime() public view returns (uint256) {
        return _closingTime;
    }

    // Identificador de este llamado
    function callId() public view returns (bytes32) {
        return _callId;
    }

    // Devuelve al creador del llamado
    function creator() public view returns (address) {
        return _creator;
    }

    /** Construye un llamado con un identificador y un tiempo de cierre.
     *  Si el `timestamp` del bloque actual es mayor o igual al tiempo de cierre especificado,
     *  revierte con el mensaje "El cierre de la convocatoria no puede estar en el pasado".
     */
    constructor(bytes32 callId_, uint256 closingTime_) {
        require(
            block.timestamp < closingTime_,
            "El cierre de la convocatoria no puede estar en el pasado"
        );
        _callId = callId_;
        _closingTime = closingTime_;
        _creator = msg.sender;
    }

    // Devuelve la cantidad total de propuestas registradas
    function proposalCount() public view returns (uint256) {
        return _proposals.length;
    }

    /** Permite registrar una propuesta espec.
     *  Registra al emisor del mensaje como emisor de la propuesta.
     *  Si el timestamp del bloque actual es mayor que el del cierre del llamado,
     *  revierte con el error "Convocatoria cerrada"
     *  Si ya se ha registrado una propuesta igual, revierte con el mensaje
     *  "La propuesta ya ha sido registrada"
     *  Emite el evento `ProposalRegistered`
     */
    function registerProposal(
        bytes32 proposal
    ) public beforeClosing proposalNotRegistered(proposal) {
        _registerProposal(proposal, msg.sender);
    }

    /** Permite registrar una propuesta especificando un emisor.
     *  Sólo puede ser ejecutada por el creador del llamado. Si no es así, revierte
     *  con el mensaje "Solo el creador puede hacer esta llamada"
     *  Si el timestamp del bloque actual es mayor que el del cierre del llamado,
     *  revierte con el error "Convocatoria cerrada"
     *  Si ya se ha registrado una propuesta igual, revierte con el mensaje
     *  "La propuesta ya ha sido registrada"
     *  Emite el evento `ProposalRegistered`
     */
    function registerProposalFor(
        bytes32 proposal,
        address sender
    ) public onlyCreator beforeClosing proposalNotRegistered(proposal) {
        _registerProposal(proposal, sender);
    }

    // Función interna que registra una propuesta
    function _registerProposal(bytes32 proposal, address sender) private {
        _proposalsData[proposal] = ProposalData({
            sender: sender,
            blockNumber: block.number,
            timestamp: block.timestamp
        });

        _proposals.push(proposal);
        emit ProposalRegistered(proposal, sender, block.number);
    }

    // Devuelve el timestamp en que se registró una propuesta
    function proposalTimestamp(bytes32 proposal) public view returns (uint256) {
        return _proposalsData[proposal].timestamp;
    }
}
