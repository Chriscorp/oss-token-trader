pragma solidity ^0.4.8;

import './ERC721TokenInterface.sol';

contract ERC721TokenSample is ERC721TokenInterface {

    uint8 public constant decimals = 18;

    bytes32 public symbol;
    bytes32 public name;

    // Owner of this contract
    address public contractOwner;

    // nonce for each account
    mapping(address => uint) nonces;

    struct Hoge {
        uint fuga;
    }

    Hoge[] public tokens;
    mapping(uint => address) public tokenIndexToOwner;
    mapping(address => uint) public ownershipTokenCount;
    mapping(uint => address) public tokenToApproved;

    // Constructor
    function ERC721TokenSample(address _contractOwner, bytes32 _tokenSymbol, bytes32 _tokenName) {
        contractOwner = _contractOwner;
        symbol = _tokenSymbol;
        name = _tokenName;
    }

    function totalSupply() public constant returns (uint totalSupply) {
        return tokens.length;
    }

    // What is the balance of a particular account?
    function nonceOf(address _owner) public constant returns (uint nonce) {
        return nonces[_owner];
    }

    // What is the balance of a particular account?
    function balanceOf(address _owner) public constant returns (uint balance) {
        return ownershipTokenCount[_owner];
    }

    function create(uint _param) public returns (bool success) {
        return createInternal(msg.sender, _param);
    }

    function createWithSign(uint _param, uint _nonce, bytes _sign) public returns (bool success) {
        bytes32 hash = calcEnvHash('createWithSign');
        hash = keccak256(hash, _param);
        hash = keccak256(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce == nonces[from] && createInternal(from, _param)) {
            nonces[from]++;
            return true;
        }
        return false;
    }

    function createInternal(address _from, uint _param) private returns (bool success) {
        if (_from != contractOwner) return false;
        Hoge memory h = Hoge(_param);
        tokens.push(h);
        tokenIndexToOwner[tokens.length - 1] = contractOwner;
        ownershipTokenCount[contractOwner]++;
        return true;
    }

    function tokensOfOwnerByIndex(address _owner, uint _index) public constant returns (uint tokenId) {
        uint256 count = 0;
        for (uint256 i = 0; i < totalSupply(); i++) {
            if (tokenIndexToOwner[i] == _owner) {
                if (count == _index) {
                    return i;
                } else {
                    count++;
                }
            }
        }
        revert();
    }

    function ownerOf(uint _tokenId) public constant returns (address owner) {
        return tokenIndexToOwner[_tokenId];
    }

    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint _tokenId) public returns (bool success) {
        return transferInternal(msg.sender, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint _tokenId) public returns (bool success) {
        if (tokenToApproved[_tokenId] == msg.sender && transferInternal(_from, _to, _tokenId)) {
            return true;
        }
        return false;
    }

    function transferWithSign(address _to, uint _tokenId, uint _nonce, bytes _sign) public returns (bool success) {
        bytes32 hash = calcEnvHash('transferWithSign');
        hash = keccak256(hash, _to);
        hash = keccak256(hash, _tokenId);
        hash = keccak256(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce == nonces[from] && transferInternal(from, _to, _tokenId)) {
            nonces[from]++;
            return true;
        }
        return false;
    }

    function transferInternal(address _from, address _to, uint _tokenId) private returns (bool success) {
        if (tokenIndexToOwner[_tokenId] == _from) {
            ownershipTokenCount[_from]--;
            tokenIndexToOwner[_tokenId] = _to;
            ownershipTokenCount[_to]++;
            delete tokenToApproved[_tokenId];
            Transfer(_from, _to, _tokenId);
            return true;
        }
        return false;
    }

    function approve(address _spender, uint _tokenId) public returns (bool success) {
        return approveInternal(msg.sender, _spender, _tokenId);
    }

    function approveWithSign(address _spender, uint _tokenId, uint _nonce, bytes _sign) public returns (bool success) {
        bytes32 hash = calcEnvHash('approveWithSign');
        hash = keccak256(hash, _spender);
        hash = keccak256(hash, _tokenId);
        hash = keccak256(hash, _nonce);
        address from = recoverAddress(hash, _sign);

        if (_nonce == nonces[from] && approveInternal(from, _spender, _tokenId)) {
            nonces[from]++;
            return true;
        }
        return false;
    }

    function approveInternal(address _from, address _spender, uint _tokenId) private returns (bool success) {
        if (tokenIndexToOwner[_tokenId] != _from) return false;
        tokenToApproved[_tokenId] = _spender;
        Approval(_from, _spender, _tokenId);
        return true;
    }

    function getApprovee(uint _tokenId) public constant returns (address approvee) {
        return tokenToApproved[_tokenId];
    }

    function calcEnvHash(bytes32 _functionName) private constant returns (bytes32 hash) {
        hash = keccak256(this);
        hash = keccak256(hash, _functionName);
    }

    function recoverAddress(bytes32 _hash, bytes _sign) private constant returns (address recoverdAddr) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        assert(_sign.length == 65);

        assembly {
            r := mload(add(_sign, 32))
            s := mload(add(_sign, 64))
            v := byte(0, mload(add(_sign, 96)))
        }

        if (v < 27) v += 27;
        assert(v == 27 || v == 28);

        recoverdAddr = ecrecover(_hash, v, r, s);
        assert(recoverdAddr != 0);
    }
}
