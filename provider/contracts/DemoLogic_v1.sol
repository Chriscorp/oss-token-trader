pragma solidity ^0.4.8;

import '../../gmo/contracts/VersionLogic.sol';
import './Demo.sol';
import './Demo_v1.sol';
import './TokenSample.sol';
import './ERC721TokenSample.sol';

contract DemoLogic_v1 is VersionLogic, Demo {
    // This is a sample contract, so don't create event contract
    event CreateToken(address _token);


    function DemoLogic_v1(ContractNameService _cns) VersionLogic (_cns, CONTRACT_NAME) {}

    function createToken(address _caller, bytes32 _symbol, bytes32 _name, uint _tokenSupply) public onlyByVersionContractOrLogic {
        address token = new TokenSample(_caller, _symbol, _name, _tokenSupply);
        CreateToken(token);
    }

    function getNonce(address _tokenAddress, address _addr) public constant returns (uint nonce) {
        return TokenSample(_tokenAddress).nonceOf(_addr);
    }

    function send(address _tokenAddress, address _to, uint _amount, uint _nonce, bytes _sign) public onlyByVersionContractOrLogic {
        assert(TokenSample(_tokenAddress).transferWithSign(_to, _amount, _nonce, _sign));
    }

    function createERC721TokenContract(address _caller, bytes32 _symbol, bytes32 _name) public onlyByVersionContractOrLogic {
        address token = new ERC721TokenSample(_caller, _symbol, _name);
        CreateToken(token);
    }

    function createERC721Token(address _from, address _tokenAddr, uint _param, uint _nonce, bytes _clientSign) public onlyByVersionContractOrLogic {
        assert(ERC721TokenSample(_tokenAddr).createWithSign(_param, _nonce, _clientSign));
    }

    function getERC721Nonce(address _tokenAddress, address _addr) public constant returns (uint nonce) {
        return ERC721TokenSample(_tokenAddress).nonceOf(_addr);
    }

    function sendERC721Token(address _tokenAddress, address _to, uint _tokenId, uint _nonce, bytes _sign) public onlyByVersionContractOrLogic {
        assert(ERC721TokenSample(_tokenAddress).transferWithSign(_to, _tokenId, _nonce, _sign));
    }
}
