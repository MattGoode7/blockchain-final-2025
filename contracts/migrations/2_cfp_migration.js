const CFPFactory = artifacts.require("./CFPFactory.sol");

module.exports = async function(deployer, network, accounts) {
    // Desplegamos el CFPFactory
    await deployer.deploy(CFPFactory);
    let cfpFactory = await CFPFactory.at(CFPFactory.address);
    
    console.log("\n=== COPIA LAS SIGUIENTES DIRECCIONES EN TU .ENV DE LA API ===");
    console.log("CFP_FACTORY_ADDRESS=" + CFPFactory.address);
    console.log("=== FIN DE DIRECCIONES PARA .ENV ===\n");
}; 