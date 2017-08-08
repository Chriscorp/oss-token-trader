pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionContract.sol';
import './SwapTrade.sol';
import './SwapTradeLogic_v1.sol';

contract SwapTrade_v1 is VersionContract, SwapTrade {
    SwapTradeLogic_v1 public logic_v1;

    function SwapTrade_v1(ContractNameService _cns, SwapTradeLogic_v1 _logic) VersionContract(_cns, CONTRACT_NAME) { logic_v1 = _logic; }

    function getBalance(address _tokenAddr, address _owner) constant returns (uint balance) {
        return logic_v1.getBalance(_tokenAddr, _owner);
    }

    function getAllowance(address _tokenAddr, address _owner, address _spender) constant returns (uint allowance) {
        return logic_v1.getAllowance(_tokenAddr, _owner, _spender);
    }

    function getTokenNonce(address _tokenAddress, address _owner) constant returns (uint nonce) {
        return logic_v1.getTokenNonce(_tokenAddress, _owner);
    }

    function approve(bytes _sign, address _tokenAddress, address _spender, uint _amount, uint _nonce, bytes _clientSign) {
        logic_v1.approve(_tokenAddress, _spender, _amount, _nonce, _clientSign);
    }

    function getTradeNonce(address _traderAddr, address _makerAddr, address _takerAddr) constant returns (uint nonce) {
        return logic_v1.getTradeNonce(_traderAddr, _makerAddr, _takerAddr);
    }

    function trade(
        bytes _sign, address _traderAddr, address _makerTokenAddr, uint _makerAmount, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) {

        bytes32 hash = calcEnvHash('trade');
        hash = sha3(hash, _traderAddr);
        hash = sha3(hash, _makerTokenAddr);
        hash = sha3(hash, _makerAmount);
        hash = sha3(hash, _makerAddress);
        hash = sha3(hash, _takerTokenAddr);
        hash = sha3(hash, _takerAmount);
        hash = sha3(hash, _expiration);
        hash = sha3(hash, _tradeNonce);
        hash = sha3(hash, _takerSign);
        hash = sha3(hash, _makerSign);
        address from = recoverAddress(hash, _sign);

        logic_v1.trade(from, _traderAddr, _makerTokenAddr, _makerAmount, _makerAddress,
            _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign);
    }
}
