pragma solidity ^0.4.8;

// https://github.com/ethereum/EIPs/issues/721
contract ERC721Interface {
    function totalSupply() public constant returns (uint totalSupply);
    function balanceOf(address _owner) public constant returns (uint balance);
    function tokensOfOwnerByIndex(address _owner, uint _index) public constant returns (uint tokenId);
    function ownerOf(uint _tokenId) public constant returns (address owner);
    function transfer(address _to, uint _tokenId) public returns (bool success);
    function approve(address _to, uint _tokenId) public returns (bool success);
    function transferFrom(address _from, address _to, uint _tokenId) public returns (bool success);
    event Transfer(address indexed _from, address indexed _to, uint _tokenId);
    event Approval(address indexed _owner, address indexed _spender, uint _tokenId);
}