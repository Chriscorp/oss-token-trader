const TokenTrader = artifacts.require('./TokenTrader.sol');

module.exports = function(deployer) {
    deployer.deploy(TokenTrader);
}