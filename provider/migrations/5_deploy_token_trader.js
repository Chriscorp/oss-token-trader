const TokenTraderWithERC721 = artifacts.require('./TokenTraderWithERC721.sol');

module.exports = function(deployer) {
    deployer.deploy(TokenTraderWithERC721);
}