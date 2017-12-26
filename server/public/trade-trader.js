/* allowance maker's or taker's sign  */
var allowanceSign = function(tokenAddress, volume) {

    // Of course, actually trader should also check the values on the client side.

    var traderAccount = getCurrentTraderAccount();
    var contract = ETH_UTIL.getContract(traderAccount);

    // at first get nonce
    contract.call(
        '', 'SwapTrade', 'getTokenNonce',
        [tokenAddress, traderAccount.getAddress()],
        SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(res);
            const traderNonce = res.toString(10);

            // sign
            traderAccount.sign(
                '', ethClient.utils.hashBySolidityType(
                    ['address', 'bytes32', 'address', 'uint', 'uint'],
                    [tokenAddress, 'approveWithSign', TOKEN_TRADER_ADDRESS, volume, traderNonce]
                ),
                function(err, sign) {
                    if (err) {
                        console.error(err);
                        return alert('error! check console.');
                    }
                    console.log(sign);

                    // approve allowance
                    contract.sendTransaction(
                        '', 'SwapTrade', 'approve',
                        [tokenAddress, TOKEN_TRADER_ADDRESS, volume, traderNonce, sign],
                        SWAP_TRADE_ABI,
                        function(err, res) {
                            if (err) {
                                allowanceSignReject(err);
                                return;
                            }
                            // back to trade-indexer.js
                            allowanceSignAccept();
                        }
                    );
                }
            );
        }
    );
};

var erc721AllowanceSign = function(tokenAddress, tokenId) {

    // Of course, actually trader should also check the values on the client side.

    var traderAccount = getCurrentTraderAccount();
    var contract = ETH_UTIL.getContract(traderAccount);

    // at first get nonce
    contract.call(
        '', 'SwapTrade', 'getTokenNonce',
        [tokenAddress, traderAccount.getAddress()],
        SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(res);
            const traderNonce = res.toString(10);

            // sign
            traderAccount.sign(
                '', ethClient.utils.hashBySolidityType(
                    ['address', 'bytes32', 'address', 'uint', 'uint'],
                    [tokenAddress, 'approveWithSign', TOKEN_TRADER_ADDRESS, tokenId, traderNonce]
                ),
                function(err, sign) {
                    if (err) {
                        console.error(err);
                        return alert('error! check console.');
                    }
                    console.log(sign);

                    // approve allowance
                    contract.sendTransaction(
                        '', 'SwapTrade', 'approveERC721',
                        [tokenAddress, TOKEN_TRADER_ADDRESS, tokenId, traderNonce, sign],
                        SWAP_TRADE_ABI,
                        function(err, res) {
                            if (err) {
                                allowanceSignReject(err);
                                return;
                            }
                            // back to trade-indexer.js
                            allowanceSignAccept();
                        }
                    );
                }
            );
        }
    );
};


/* sell token maker's sign */
var sellSign = function(tokenFrom, tokenTo, price, amount) {

    // Of course, actually trader should also check the values on the client side.

    var traderAccount = getCurrentTraderAccount();

    traderAccount.sign(
        '',
        ethClient.utils.hashBySolidityType(
            ['address', 'address', 'uint', 'uint'],
            [tokenFrom, tokenTo, price, amount]
        ),
        function(err, sign) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(sign);
            // back to trade-indexer.js
            sellSignAccept(tokenFrom, tokenTo, price, amount, sign);
        }
    );
};

var sellERC721Sell = function(tokenFrom, tokenTo, price, tokenId) {

    // Of course, actually trader should also check the values on the client side.

    var traderAccount = getCurrentTraderAccount();

    traderAccount.sign(
        '',
        ethClient.utils.hashBySolidityType(
            ['address', 'address', 'uint', 'uint'],
            [tokenFrom, tokenTo, price, tokenId]
        ),
        function(err, sign) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(sign);
            // back to trade-indexer.js
            sellSignAccept(tokenFrom, tokenTo, price, tokenId, sign);
        }
    );
};

/* trade token taker's sign */
var tradeTakerSign = function(recordId, makerAddress, makerTokenAddr, makerAmount, takerTokenAddr, takerAmount) {

    // Of course, actually trader should also check the values on the client side.

    var takerAccount = getCurrentTraderAccount();
    var contract = ETH_UTIL.getContract(takerAccount);

    // at first get trade nonce
    contract.call(
        '', 'SwapTrade', 'getTradeNonce',
        [TOKEN_TRADER_ADDRESS, makerAddress, takerAccount.getAddress()],
        SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(res);

            var _tradeNonce = res.toString(10);
            var _expiration = new Date().getTime()/1000 + 60;

            // sign
            takerAccount.sign(
                '',
                ethClient.utils.hashBySolidityType(
                    ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint'],
                    [TOKEN_TRADER_ADDRESS, 'trade', makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, _expiration, _tradeNonce]
                ),
                function(err, sign) {
                    if (err) {
                        console.error(err);
                        return alert('error! check console.');
                    }
                    console.log(sign);
                    // back to trade-indexer.js
                    tradeTakerSignAccept(recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, _expiration, _tradeNonce, sign);
                }
            );
        }
    );
};

/* trade token taker's sign */
var erc721TradeTakerSign = function(recordId, makerAddress, makerTokenAddr, makerTokenId, takerTokenAddr, takerAmount) {

    // Of course, actually trader should also check the values on the client side.

    var takerAccount = getCurrentTraderAccount();
    var contract = ETH_UTIL.getContract(takerAccount);

    // at first get trade nonce
    contract.call(
        '', 'SwapTrade', 'getTradeNonce',
        [TOKEN_TRADER_ADDRESS, makerAddress, takerAccount.getAddress()],
        SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(res);

            var _tradeNonce = res.toString(10);
            var _expiration = new Date().getTime()/1000 + 60;

            // sign
            takerAccount.sign(
                '',
                ethClient.utils.hashBySolidityType(
                    ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint'],
                    [TOKEN_TRADER_ADDRESS, 'tradeWithERC721', makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, _expiration, _tradeNonce]
                ),
                function(err, sign) {
                    if (err) {
                        console.error(err);
                        return alert('error! check console.');
                    }
                    console.log(sign);
                    // back to trade-indexer.js
                    erc721TradeTakerSignAccept(recordId, makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, _expiration, _tradeNonce, sign);
                }
            );
        }
    );
};


/* trade token maker's sign */
var tradeMakerSign = function(recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign) {

    // Of course, actually maker should also check the values on the client side.

    var makerAccount = getAccountFromAddress(makerAddress);
    var contract = ETH_UTIL.getContract(makerAccount);

    var hash = ethClient.utils.hashBySolidityType(
        ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint'],
        [TOKEN_TRADER_ADDRESS, 'trade', makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce]
    );
    var takerAddress = ethClient.utils.recoverAddress(hash, takerSign);
    console.log(takerAddress);

    // Actually maker should check the conditions taker presented carefully.
    // If maker agree, sign and return it.

    makerAccount.sign(
        '',
        ethClient.utils.hashBySolidityType(
            ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint', 'bytes'],
            [TOKEN_TRADER_ADDRESS, 'trade', makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign]),
        function(err, sign) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(sign);
            // back to trade-indexer.js
            tradeMakerSignAccept(
                recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign, sign);
        }
    );
};

var erc721TradeMakerSign = function(recordId, makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign) {

    // Of course, actually maker should also check the values on the client side.

    var makerAccount = getAccountFromAddress(makerAddress);
    var contract = ETH_UTIL.getContract(makerAccount);

    var hash = ethClient.utils.hashBySolidityType(
        ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint'],
        [TOKEN_TRADER_ADDRESS, 'trade', makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce]
    );
    var takerAddress = ethClient.utils.recoverAddress(hash, takerSign);
    console.log(takerAddress);

    // Actually maker should check the conditions taker presented carefully.
    // If maker agree, sign and return it.

    makerAccount.sign(
        '',
        ethClient.utils.hashBySolidityType(
            ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint', 'bytes'],
            [TOKEN_TRADER_ADDRESS, 'tradeWithERC721', makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign]),
        function(err, sign) {
            if (err) {
                console.error(err);
                return alert('error! check console.');
            }
            console.log(sign);
            // back to trade-indexer.js
            erc721TradeMakerSignAccept(
                recordId, makerTokenAddr, makerTokenId, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign, sign);
        }
    );
};

// This is for DEMO (For real service, use the key in the terminal of the end user.)
var getCurrentTraderAccount = function() {
    var trader = $('#trader-address').val();
    var traderAAcount = LOCAL_STORAGE.getTraderAAccount();
    if (traderAAcount.getAddress() == trader) {
        return traderAAcount;
    }
    return LOCAL_STORAGE.getTraderBAccount();
};
// This is for DEMO (For real service, use the key in the terminal of the end user.)
var getAccountFromAddress = function(address) {
    var traderAAcount = LOCAL_STORAGE.getTraderAAccount();
    if (traderAAcount.getAddress() == address) {
        return traderAAcount;
    }
    var traderBAcount = LOCAL_STORAGE.getTraderBAccount();
    if (traderBAcount.getAddress() == address) {
        return traderBAcount;
    }
    throw new Error('there is no account for address "' + address + '"');
};
