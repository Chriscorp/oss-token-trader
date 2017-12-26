pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionContract.sol';
import './Demo.sol';
import './DemoLogic_v1.sol';

contract Demo_v1 is VersionContract, Demo {
    DemoLogic_v1 public logic_v1;

    function Demo_v1(ContractNameService _cns, DemoLogic_v1 _logic) VersionContract(_cns, CONTRACT_NAME) { logic_v1 = _logic; }

    function createToken(bytes _sign, bytes32 _symbol, bytes32 _name, uint _totalSupply) public {
        bytes32 hash = calcEnvHash('createToken');
        hash = keccak256(hash, _symbol);
        hash = keccak256(hash, _name);
        hash = keccak256(hash, _totalSupply);
        address from = recoverAddress(hash, _sign);

        logic_v1.createToken(from, _symbol, _name, _totalSupply);
    }

    function getNonce(address _tokenAddress, address _addr) public constant returns (uint nonce) {
        return logic_v1.getNonce(_tokenAddress, _addr);
    }

    function send(bytes _sign, address _tokenAddress, address _to, uint _amount,  uint _nonce, bytes _clientSign) public {
        logic_v1.send(_tokenAddress, _to, _amount, _nonce, _clientSign);
    }

    function createERC721TokenContract(bytes _sign, bytes32 _symbol, bytes32 _name) public {
        bytes32 hash = calcEnvHash('createERC721TokenContract');
        hash = keccak256(hash, _symbol);
        hash = keccak256(hash, _name);
        address from = recoverAddress(hash, _sign);

        logic_v1.createERC721TokenContract(from, _symbol, _name);
    }

    function createERC721Token(bytes _sign, address _tokenAddress, uint _param, uint _nonce, bytes _clientSign) public {
        bytes32 hash = calcEnvHash('createERC721Token');
        hash = sha3(hash, _tokenAddress);
        hash = sha3(hash, _param);
        hash = sha3(hash, _nonce);
        hash = sha3(hash, _clientSign);
        address from = recoverAddress(hash, _sign);

        logic_v1.createERC721Token(from, _tokenAddress, _param, _nonce, _clientSign);
    }

    function getERC721Nonce(address _tokenAddress, address _addr) public constant returns (uint nonce) {
        return logic_v1.getNonce(_tokenAddress, _addr);
    }

    function sendERC721Token(bytes _sign, address _tokenAddress, address _to, uint _tokenId, uint _nonce, bytes _clientSign) public {
        logic_v1.sendERC721Token(_tokenAddress, _to, _tokenId, _nonce, _clientSign);
    }
}
