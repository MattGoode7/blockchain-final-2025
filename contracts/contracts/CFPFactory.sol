// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CFP.sol";
import "./LlamadosRegistrar.sol";

contract CFPFactory {
    // Eventos con parámetros indexados para mejor filtrado
    event CFPCreated(address indexed creator, bytes32 indexed callId, CFP cfp);

    // Eventos que se emiten al registrar, autorizar y desautorizar cuentas
    event AccountRegistered(address indexed account);
    event AccountAuthorized(address indexed account);
    event AccountUnauthorized(address indexed account);

    // Estructuras de datos
    struct CallForProposals {
        address creator;
        CFP cfp;
    }

    // Enum que representa el estado de una cuenta
    enum AccountStatus {
        NotRegistered,
        Pending,
        Authorized
    }

    // Variables de estado
    address private immutable _owner;
    LlamadosRegistrar public llamadosRegistrar;
    address[] private _pending;
    address[] private _creators;
    mapping(bytes32 => CallForProposals) private _calls;
    mapping(address => AccountStatus) private _accounts;
    mapping(address => bytes32[]) private _callsCreatedBy;
    mapping(address => uint256) private _pendingIndex;
    mapping(address => bool) private _isCreatorInList;
    bytes32[] private _callIds;

    // Modifiers
    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "Solo el creador puede hacer esta llamada"
        );
        _;
    }

    modifier notRegistered(address account) {
        require(_accounts[account] == AccountStatus.NotRegistered, "Ya se ha registrado");
        _;
    }

    modifier onlyAuthorized(address account) {
        require(_accounts[account] == AccountStatus.Authorized, "No autorizado");
        _;
    }

    modifier validCallId(bytes32 callId) {
        require(_calls[callId].creator == address(0), "El llamado ya existe");
        _;
    }

    modifier callExists(bytes32 callId) {
        require(_calls[callId].creator != address(0), "El llamado no existe");
        _;
    }

    modifier validIndex(uint index, uint length) {
        require(index < length, "Indice fuera de rango");
        _;
    }

    constructor() {
        _owner = msg.sender;
    }

    /**
     * Establece el LlamadosRegistrar después del deploy
     * Solo puede ser llamado por el owner
     */
    function setLlamadosRegistrar(address _llamadosRegistrar) external onlyOwner {
        require(address(llamadosRegistrar) == address(0), "LlamadosRegistrar ya establecido");
        llamadosRegistrar = LlamadosRegistrar(_llamadosRegistrar);
    }

    // Dirección del dueño de la factoría
    function owner() public view returns (address) {
        return _owner;
    }

    // Devuelve el llamado asociado con un callId
    function calls(
        bytes32 callId
    ) public view returns (CallForProposals memory) {
        return _calls[callId];
    }

    // Devuelve la dirección de un creador de la lista de creadores
    function creators(
        uint index
    ) public view validIndex(index, _creators.length) returns (address) {
        return _creators[index];
    }

    /** Crea un llamado, con un identificador y un tiempo de cierre
     *  Si ya existe un llamado con ese identificador, revierte con el mensaje de error "El llamado ya existe"
     *  Si el emisor no está autorizado a crear llamados, revierte con el mensaje "No autorizado"
     */
    function create(
        bytes32 callId,
        uint256 timestamp
    ) public onlyAuthorized(msg.sender) validCallId(callId) returns (CFP) {
        return _createCFP(callId, timestamp, msg.sender);
    }

    /**
     * Crea un llamado con registro ENS
     * Solo puede ser invocada por una cuenta autorizada
     */
    function createWithENS(
        bytes32 callId,
        uint256 timestamp
    ) public onlyAuthorized(msg.sender) validCallId(callId) returns (CFP) {
        require(address(llamadosRegistrar) != address(0), "LlamadosRegistrar no establecido");
        
        CFP newCFP = _createCFP(callId, timestamp, msg.sender);
        
        // Registrar en ENS usando el label hash del callId
        bytes32 labelHash = keccak256(abi.encodePacked(callId));
        llamadosRegistrar.register(labelHash, msg.sender);
        
        return newCFP;
    }

    /**
     * Crea un llamado, estableciendo a `creator` como creador del mismo.
     * Sólo puede ser invocada por el dueño de la factoría.
     * Se comporta en todos los demás aspectos como `createFor(bytes32 callId, uint timestamp)`
     */
    function createFor(
        bytes32 callId,
        uint timestamp,
        address creator
    )
        public
        onlyOwner
        validCallId(callId)
        returns (CFP)
    {
        return _createCFP(callId, timestamp, creator);
    }

    /**
     * Crea un llamado con registro ENS para un creador específico
     * Solo puede ser invocada por el dueño de la factoría
     */
    function createForWithENS(
        bytes32 callId,
        uint timestamp,
        address creator
    )
        public
        onlyOwner
        validCallId(callId)
        returns (CFP)
    {
        require(address(llamadosRegistrar) != address(0), "LlamadosRegistrar no establecido");
        
        CFP newCFP = _createCFP(callId, timestamp, creator);
        
        // Registrar en ENS usando el label hash del callId
        bytes32 labelHash = keccak256(abi.encodePacked(callId));
        llamadosRegistrar.register(labelHash, creator);
        
        return newCFP;
    }

    // Devuelve la cantidad de cuentas que han creado llamados.
    function creatorsCount() public view returns (uint256) {
        return _creators.length;
    }

    /// Devuelve el identificador del llamado que está en la posición `index` de la lista de llamados creados por `creator`
    function createdBy(
        address creator,
        uint index
    )
        public
        view
        validIndex(index, _callsCreatedBy[creator].length)
        returns (bytes32)
    {
        return _callsCreatedBy[creator][index];
    }

    // Devuelve la cantidad de llamados creados por `creator`
    function createdByCount(address creator) public view returns (uint256) {
        return _callsCreatedBy[creator].length;
    }

    // Devuelve los datos de un llamado específico
    function getCallData(bytes32 callId) public view callExists(callId) returns (address creator, address cfpAddress) {
        CallForProposals memory call = _calls[callId];
        return (call.creator, address(call.cfp));
    }

    // Funcion privada para crear un nuevo llamado
    // Se encarga de crear el contrato CFP y de registrar el llamado en la lista de llamados
    // creados por el emisor del mensaje.
    // Si el creador no está en la lista de creadores, lo agrega.
    function _createCFP(
        bytes32 callId,
        uint timestamp,
        address creator
    ) private returns (CFP) {
        CFP newCFP = new CFP(callId, timestamp);
        _calls[callId] = CallForProposals(creator, newCFP);
        _callIds.push(callId);

        if (!_isCreatorInList[creator]) {
            _creators.push(creator);
            _isCreatorInList[creator] = true;
        }
        _callsCreatedBy[creator].push(callId);

        emit CFPCreated(creator, callId, newCFP);
        return newCFP;
    }

    /** Permite a un usuario registrar una propuesta, para un llamado con identificador `callId`.
     *  Si el llamado no existe, revierte con el mensaje  "El llamado no existe".
     *  Registra la propuesta en el llamado asociado con `callId` y pasa como creador la dirección del emisor del mensaje.
     */
    function registerProposal(
        bytes32 callId,
        bytes32 proposal
    ) public callExists(callId) {
        _calls[callId].cfp.registerProposalFor(proposal, msg.sender);
    }

    /** Permite que una cuenta se registre para poder crear llamados.
     *  El registro queda en estado pendiente hasta que el dueño de la factoría lo autorice.
     *  Si ya se ha registrado, revierte con el mensaje "Ya se ha registrado"
     */
    function register() public notRegistered(msg.sender) {
        _accounts[msg.sender] = AccountStatus.Pending;
        _pendingIndex[msg.sender] = _pending.length;
        _pending.push(msg.sender);
        emit AccountRegistered(msg.sender);
    }

    /** Autoriza a una cuenta a crear llamados.
     *  Sólo puede ser ejecutada por el dueño de la factoría.
     *  En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
     *  Si la cuenta se ha registrado y está pendiente, la quita de la lista de pendientes.
     */
    function authorize(address creator) public onlyOwner {
        if (_accounts[creator] == AccountStatus.NotRegistered) {
            _accounts[creator] = AccountStatus.Authorized;
        } else if (_accounts[creator] == AccountStatus.Pending) {
            removePending(creator);
            _accounts[creator] = AccountStatus.Authorized;
        }
        emit AccountAuthorized(creator);
    }

    /** Quita la autorización de una cuenta para crear llamados.
     *  Sólo puede ser ejecutada por el dueño de la factoría.
     *  En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
     *  Si la cuenta se ha registrado y está pendiente, la quita de la lista de pendientes.
     */
    function unauthorize(address creator) public onlyOwner {
        if (_accounts[creator] == AccountStatus.Pending) {
            removePending(creator);
        }
        _accounts[creator] = AccountStatus.NotRegistered;
        emit AccountUnauthorized(creator);
    }

    // Devuelve la lista de todas las registraciones pendientes.
    // Sólo puede ser ejecutada por el dueño de la factoría
    // En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
    function getAllPending() public view onlyOwner returns (address[] memory) {
        return _pending;
    }

    // Devuelve la registración pendiente con índice `index`
    // Sólo puede ser ejecutada por el dueño de la factoría
    // En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
    function getPending(
        uint index
    )
        public
        view
        onlyOwner
        validIndex(index, _pending.length)
        returns (address)
    {
        return _pending[index];
    }

    // Devuelve la cantidad de registraciones pendientes.
    // Sólo puede ser ejecutada por el dueño de la factoría
    // En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
    function pendingCount() public view onlyOwner returns (uint256) {
        return _pending.length;
    }

    // Remueve una cuenta de la lista de pendientes.
    function removePending(address creator) private {
        require(_accounts[creator] == AccountStatus.Pending, "No esta pendiente");

        uint index = _pendingIndex[creator];
        uint lastIndex = _pending.length - 1;

        if (index != lastIndex) {
            address last = _pending[lastIndex];
            _pending[index] = last;
            _pendingIndex[last] = index;
        }

        _pending.pop();
        delete _pendingIndex[creator];
    }

    // Devuelve verdadero si una cuenta se ha registrado, tanto si su estado es pendiente como si ya se la ha autorizado.
    function isRegistered(address account) public view returns (bool) {
        return _accounts[account] != AccountStatus.NotRegistered;
    }

    // Devuelve verdadero si una cuenta está autorizada a crear llamados.
    function isAuthorized(address account) public view returns (bool) {
        return _accounts[account] == AccountStatus.Authorized;
    }
}
