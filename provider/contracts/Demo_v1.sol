pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionContract.sol';
import './Demo.sol';
import './DemoLogic_v1.sol';

contract Demo_v1 is VersionContract, Demo {
    DemoLogic_v1 public logic_v1;

    function Demo_v1(ContractNameService _cns, DemoLogic_v1 _logic) VersionContract(_cns, CONTRACT_NAME) { logic_v1 = _logic; }

    function createToken(bytes _sign, bytes32 _symbol, bytes32 _name, uint _totalSupply) {
        bytes32 hash = calcEnvHash('createToken');
        hash = sha3(hash, _symbol);
        hash = sha3(hash, _name);
        hash = sha3(hash, _totalSupply);
        address from = recoverAddress(hash, _sign);

        logic_v1.createToken(from, _symbol, _name, _totalSupply);
    }

    function getNonce(address _tokenAddress, address _addr) constant returns (uint nonce) {
        return logic_v1.getNonce(_tokenAddress, _addr);
    }

    function send(bytes _sign, address _tokenAddress, address _to, uint _amount,  uint _nonce, bytes _clientSign) {
        logic_v1.send(_tokenAddress, _to, _amount, _nonce, _clientSign);
    }
}
