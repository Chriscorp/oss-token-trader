pragma solidity ^0.4.8;

import './ERC20Interface.sol';
import './ERC721Interface.sol';
import './TokenTrader.sol';

contract TokenTraderWithERC721 is TokenTrader{

    function tradeWithERC721(
        address _makerTokenAddr, uint _makerTokenId, address _makerAddress, address _takerTokenAddr, uint _takerAmount,
        uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) public returns (bool success) {

        bytes32 hash = calcEnvHash('tradeWithERC721');
        hash = keccak256(hash, _makerTokenAddr);
        hash = keccak256(hash, _makerTokenId);
        hash = keccak256(hash, _makerAddress);
        hash = keccak256(hash, _takerTokenAddr);
        hash = keccak256(hash, _takerAmount);
        hash = keccak256(hash, _expiration);
        hash = keccak256(hash, _tradeNonce);
        address takerAddress = recoverAddress(hash, _takerSign);

        hash = keccak256(hash, _takerSign);
        address makerAddress = recoverAddress(hash, _makerSign);

        if (makerAddress != _makerAddress || _tradeNonce != getNonce(makerAddress, takerAddress) || _expiration < now) return false;
        nonces[makerAddress][takerAddress]++;

        assert(ERC721Interface(_makerTokenAddr).transferFrom(makerAddress, takerAddress, _makerTokenId) && ERC20Interface(_takerTokenAddr).transferFrom(takerAddress, makerAddress, _takerAmount));
        return true;
    }
}
