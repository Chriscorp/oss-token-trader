pragma solidity ^0.4.18;

import '../../gmo/contracts/VersionLogic.sol';
import './SwapTrade.sol';
import './TokenInterface.sol';
import './ERC721TokenInterface.sol';
import './TokenTraderWithERC721.sol';

contract SwapTradeLogic_v1 is VersionLogic, SwapTrade {

    function SwapTradeLogic_v1(ContractNameService _cns) VersionLogic (_cns, CONTRACT_NAME) {}

    function getBalance(address _tokenAddr, address _owner) public constant returns (uint balance) {
        return TokenInterface(_tokenAddr).balanceOf(_owner);
    }

    function getAllowance(address _tokenAddr, address _owner, address _spender) public constant returns (uint allowance) {
        return TokenInterface(_tokenAddr).allowance(_owner, _spender);
    }

    function getTokenNonce(address _tokenAddr, address _owner) public constant returns (uint nonce) {
        return TokenInterface(_tokenAddr).nonceOf(_owner);
    }

    function approve(address _tokenAddr, address _spender, uint _amount, uint _nonce, bytes _sign) public {
        assert(TokenInterface(_tokenAddr).approveWithSign(_spender, _amount, _nonce, _sign));
    }

    function getERC721Balance(address _tokenAddr, address _owner) public constant returns (uint balance) {
        return ERC721TokenInterface(_tokenAddr).balanceOf(_owner);
    }

    function getERC721TokenApprovee(address _tokenAddr, uint _tokenId) public constant returns (address approvee) {
        return ERC721TokenInterface(_tokenAddr).getApprovee(_tokenId);
    }

    function approveERC721(address _tokenAddr, address _spender, uint _tokenId, uint _nonce, bytes _sign) public {
        assert(TokenInterface(_tokenAddr).approveWithSign(_spender, _tokenId, _nonce, _sign));
    }

    function getERC721TokenNonce(address _tokenAddr, address _owner) public constant returns (uint nonce) {
        return ERC721TokenInterface(_tokenAddr).nonceOf(_owner);
    }

    function tokensOfOwnerByIndex(address _tokenAddr, address _owner, uint _index) public constant returns (uint tokenId) {
        return ERC721TokenInterface(_tokenAddr).tokensOfOwnerByIndex(_owner, _index);
    }

    function getTradeNonce(address _traderAddr, address _makerAddr, address _takerAddr) public constant returns (uint nonce) {
        return TokenTraderWithERC721(_traderAddr).getNonce(_makerAddr, _takerAddr);
    }

    function trade(
        address _from, address _traderAddr, address _makerTokenAddr, uint _makerAmount, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) public onlyByVersionContractOrLogic {
        assert(TokenTraderWithERC721(_traderAddr).trade(_makerTokenAddr, _makerAmount, _makerAddress, _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign));
    }

    function tradeERC721(
        address _from, address _traderAddr, address _makerTokenAddr, uint _makerTokenId, address _makerAddress,
        address _takerTokenAddr, uint _takerAmount, uint _expiration, uint _tradeNonce, bytes _takerSign, bytes _makerSign) public onlyByVersionContractOrLogic {
        assert(TokenTraderWithERC721(_traderAddr).tradeWithERC721(_makerTokenAddr, _makerTokenId, _makerAddress, _takerTokenAddr, _takerAmount, _expiration, _tradeNonce, _takerSign, _makerSign));
    }
}
