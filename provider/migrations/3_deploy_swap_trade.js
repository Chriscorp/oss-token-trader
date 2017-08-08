const ContractNameService = artifacts.require('./ContractNameService.sol'),
    SwapTrade_v1 = artifacts.require('./SwapTrade_v1.sol'),
    SwapTradeLogic_v1 = artifacts.require('./SwapTradeLogic_v1.sol');

module.exports = function(deployer) {
    deployer.deploy(SwapTradeLogic_v1, ContractNameService.address).then(function() {
        return deployer.deploy(SwapTrade_v1, ContractNameService.address, SwapTradeLogic_v1.address);
    }).then(function() {
        return ContractNameService.deployed();
    }).then(function(instance) {
        return instance.setContract('SwapTrade', 1, SwapTrade_v1.address, SwapTradeLogic_v1.address);
    });
}