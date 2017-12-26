pragma solidity ^0.4.18;

import '../../gmo/contracts/VersionContract.sol';
import './SwapTrade.sol';
import './SwapTradeLogic_v1.sol';

contract SwapTrade_v1 is VersionContract, SwapTrade {
    SwapTradeLogic_v1 public logic_v1;

    function SwapTrade_v1(ContractNameService _cns, SwapTradeLogic_v1 _logic) VersionContract(_cns, CONTRACT_NAME) { logic_v1 = _logic; }

    function getBalance(address _tokenAddr, address _owner) public constant returns (uint balance) {
        return logic_v1.getBalance(_tokenAddr, _owner);
    }

    function getAllowance(address _tokenAddr, address _owner, address _spender) public constant returns (uint allowance) {
        return logic_v1.getAllowance(_tokenAddr, _owner, _spender);
    }

    function getTokenNonce(address _tokenAddress, address _owner) public constant returns (uint nonce) {
        return logic_v1.getTokenNonce(_tokenAddress, _owner);
    }

    function approve(bytes _sign, address _tokenAddress, address _spender, uint _amount, uint _nonce, bytes _clientSign) public {
        logic_v1.approve(_tokenAddress, _spender, _amount, _nonce, _clientSign);
    }

    function getERC721Balance(address _tokenAddr, address _owner) public constant returns (uint balance) {
        return logic_v1.getERC721Balance(_tokenAddr, _owner);
    }

    function getERC721TokenApprovees(address _tokenAddress, uint[] _tokenIds) public constant returns (address[] approvees) {
        approvees = new address[](_tokenIds.length);
        for (uint i = 0; i < _tokenIds.length; i++) {
            approvees[i] = logic_v1.getERC721TokenApprovee(_tokenAddress, _tokenIds[i]);
        }
    }

    function getERC721TokenNonce(address _tokenAddress, address _owner) public constant returns (uint nonce) {
        return logic_v1.getERC721TokenNonce(_tokenAddress, _owner);
    }

    function approveERC721(bytes _sign, address _tokenAddress, address _spender, uint _tokenId, uint _nonce, bytes _clientSign) public {
        logic_v1.approveERC721(_tokenAddress, _spender, _tokenId, _nonce, _clientSign);
    }

    function getERC721Tokens(address _tokenAddress, address _owner) public constant returns (uint[] tokenIds) {
        uint length = logic_v1.getERC721Balance(_tokenAddress, _owner);
        tokenIds = new uint[](length);
        for (uint i = 0; i < length; i++) {
            tokenIds[i] = logic_v1.tokensOfOwnerByIndex(_tokenAddress, _owner, i);
        }
    }

    function getTradeNonce(address _traderAddr, address _makerAddr, address _takerAddr) public constant returns (uint nonce) {
        return logic_v1.getTradeNonce(_traderAddr, _makerAddr, _takerAddr);
    }

    function trade(
        bytes _sign, address _traderAddr, address _makerTokenAddr, uint _makerAmount, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) public {

        bytes32 hash = calcEnvHash('trade');
        hash = keccak256(hash, _traderAddr);
        hash = keccak256(hash, _makerTokenAddr);
        hash = keccak256(hash, _makerAmount);
        hash = keccak256(hash, _makerAddress);
        hash = keccak256(hash, _takerTokenAddr);
        hash = keccak256(hash, _takerAmount);
        hash = keccak256(hash, _expiration);
        hash = keccak256(hash, _tradeNonce);
        hash = keccak256(hash, _takerSign);
        hash = keccak256(hash, _makerSign);
        address from = recoverAddress(hash, _sign);

        logic_v1.trade(from, _traderAddr, _makerTokenAddr, _makerAmount, _makerAddress,
            _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign);
    }

    function tradeERC721(
        bytes _sign, address _traderAddr, address _makerTokenAddr, uint _makerTokenId, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) public {

        bytes32 hash = calcEnvHash('tradeERC721');
        hash = keccak256(hash, _traderAddr);
        hash = keccak256(hash, _makerTokenAddr);
        hash = keccak256(hash, _makerTokenId);
        hash = keccak256(hash, _makerAddress);
        hash = keccak256(hash, _takerTokenAddr);
        hash = keccak256(hash, _takerAmount);
        hash = keccak256(hash, _expiration);
        hash = keccak256(hash, _tradeNonce);
        hash = keccak256(hash, _takerSign);
        hash = keccak256(hash, _makerSign);
        address from = recoverAddress(hash, _sign);

        logic_v1.tradeERC721(from, _traderAddr, _makerTokenAddr, _makerTokenId, _makerAddress,
            _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign);
    }
}
