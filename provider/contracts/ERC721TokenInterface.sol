pragma solidity ^0.4.8;

import './ERC721Interface.sol';

contract ERC721TokenInterface is ERC721Interface {
    function nonceOf(address _owner) public constant returns (uint nonce);
    function approveWithSign(address _spender, uint _tokenId, uint _nonce, bytes _sign) public returns (bool success);
    function transferWithSign(address _to, uint _tokenId, uint _nonce, bytes _sign) public returns (bool success);
    function getApprovee(uint _tokenId) public constant returns (address approvee);
}