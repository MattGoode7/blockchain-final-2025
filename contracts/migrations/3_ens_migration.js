const ENSRegistry = artifacts.require("./ENSRegistry.sol");
const FIFSRegistrar = artifacts.require("./FIFSRegistrar.sol");
const ReverseRegistrar = artifacts.require("./ReverseRegistrar.sol");
const PublicResolver = artifacts.require("./PublicResolver.sol");
const LlamadosRegistrar = artifacts.require("./LlamadosRegistrar.sol");
const UsuariosRegistrar = artifacts.require("./UsuariosRegistrar.sol");
const CFPFactory = artifacts.require("./CFPFactory.sol");

const web3 = new (require("web3"))();
const namehash = require("eth-ens-namehash");
const keccak256 = web3.utils.keccak256;

module.exports = async function(deployer, network, accounts) {
    var tld = "cfp";
    
    // Primero desplegamos el registro (registry)
    await deployer.deploy(ENSRegistry);
    let ens = await ENSRegistry.at(ENSRegistry.address);
    
    // Conviene desplegar un resolutor público
    await deployer.deploy(PublicResolver, ENSRegistry.address);
    let publicResolver = await PublicResolver.at(PublicResolver.address);
    
    // Para facilitar su uso, le damos un nombre
    await ens.setSubnodeOwner("0x0", keccak256("resolver"), accounts[0]);
    
    // Declaramos el resolver de este nuevo dominio de primer nivel
    await ens.setResolver(namehash.hash("resolver"), PublicResolver.address);
    
    // Registramos en el resolver su propia dirección asociada al nuevo dominio
    await publicResolver.setAddr(namehash.hash("resolver"), PublicResolver.address);
    
    // Desplegamos el registrador reverso
    await deployer.deploy(ReverseRegistrar, ENSRegistry.address, PublicResolver.address);
    
    // Transferimos la propiedad del dominio "addr.reverse" al registrador
    await ens.setSubnodeOwner("0x0", keccak256("reverse"), accounts[0]);
    await ens.setSubnodeOwner(namehash.hash("reverse"), keccak256("addr"), ReverseRegistrar.address);
    
    // Configuramos el dominio principal cfp para que sea propiedad de accounts[0]
    await ens.setSubnodeOwner("0x0", keccak256(tld), accounts[0]);
    
    // Ahora podemos crear los subdominios
    await ens.setSubnodeOwner(namehash.hash(tld), keccak256("llamados"), accounts[0]);
    await ens.setSubnodeOwner(namehash.hash(tld), keccak256("usuarios"), accounts[0]);
    
    // Desplegamos los registradores con los nodos correctos
    await deployer.deploy(LlamadosRegistrar, ENSRegistry.address, namehash.hash("llamados." + tld));
    await deployer.deploy(UsuariosRegistrar, ENSRegistry.address, namehash.hash("usuarios." + tld));
    
    // Transferimos la propiedad de los subdominios a los registradores
    await ens.setSubnodeOwner(namehash.hash(tld), keccak256("llamados"), LlamadosRegistrar.address);
    await ens.setSubnodeOwner(namehash.hash(tld), keccak256("usuarios"), UsuariosRegistrar.address);
    
    // Configuramos el LlamadosRegistrar en el CFPFactory
    let cfpFactory = await CFPFactory.deployed();
    await cfpFactory.setLlamadosRegistrar(LlamadosRegistrar.address);
    
    console.log("\n=== COPIA LAS SIGUIENTES DIRECCIONES EN TU .ENV DE LA API ===");
    console.log("ENS_REGISTRY_ADDRESS=" + ENSRegistry.address);
    console.log("PUBLIC_RESOLVER_ADDRESS=" + PublicResolver.address);
    console.log("REVERSE_REGISTRAR_ADDRESS=" + ReverseRegistrar.address);
    console.log("LLAMADOS_REGISTRAR_ADDRESS=" + LlamadosRegistrar.address);
    console.log("USUARIOS_REGISTRAR_ADDRESS=" + UsuariosRegistrar.address);
    console.log("=== FIN DE DIRECCIONES PARA .ENV ===\n");
}; 