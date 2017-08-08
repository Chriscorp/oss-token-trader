pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionLogic.sol';
import './Demo.sol';
import './Demo_v1.sol';
import './TokenSample.sol';

contract DemoLogic_v1 is VersionLogic, Demo {
    // This is a sample contract, so don't create event contract
    event CreateToken(address _token);

    function DemoLogic_v1(ContractNameService _cns) VersionLogic (_cns, CONTRACT_NAME) {}

    function createToken(address _caller, bytes32 _simbol, bytes32 _name, uint _tokenSupply) onlyByVersionContractOrLogic {
        address token = new TokenSample(_caller, _simbol, _name, _tokenSupply);
        CreateToken(token);
    }

    function getNonce(address _tokenAddress, address _addr) constant returns (uint nonce) {
        return TokenSample(_tokenAddress).nonceOf(_addr);
    }

    function send(address _tokenAddress, address _to, uint _amount, uint _nonce, bytes _sign) onlyByVersionContractOrLogic {
        assert(TokenSample(_tokenAddress).transferWithSign(_to, _amount, _nonce, _sign));
    }
}
