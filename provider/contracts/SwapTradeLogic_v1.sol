pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionLogic.sol';
import './SwapTrade.sol';
import './TokenInterface.sol';
import './TokenTrader.sol';

contract SwapTradeLogic_v1 is VersionLogic, SwapTrade {

    function SwapTradeLogic_v1(ContractNameService _cns) VersionLogic (_cns, CONTRACT_NAME) {}

    function getBalance(address _tokenAddr, address _owner) constant returns (uint balance) {
        return TokenInterface(_tokenAddr).balanceOf(_owner);
    }

    function getAllowance(address _tokenAddr, address _owner, address _spender) constant returns (uint allowance) {
        return TokenInterface(_tokenAddr).allowance(_owner, _spender);
    }

    function getTokenNonce(address _tokenAddr, address _owner) constant returns (uint nonce) {
        return TokenInterface(_tokenAddr).nonceOf(_owner);
    }

    function approve(address _tokenAddr, address _spender, uint _amount, uint _nonce, bytes _sign) {
        assert(TokenInterface(_tokenAddr).approveWithSign(_spender, _amount, _nonce, _sign));
    }

    function getTradeNonce(address _traderAddr, address _makerAddr, address _takerAddr) constant returns (uint nonce) {
        return TokenTrader(_traderAddr).getNonce(_makerAddr, _takerAddr);
    }

    function trade(
        address _from, address _traderAddr, address _makerTokenAddr, uint _makerAmount, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) onlyByVersionContractOrLogic {
        assert(TokenTrader(_traderAddr).trade(_makerTokenAddr, _makerAmount, _makerAddress, _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign));
    }
}
