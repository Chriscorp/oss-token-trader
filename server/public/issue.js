$(document).ready(function() {

    var issuerAccount = LOCAL_STORAGE.getIssuerAccount();
    var indexerAccount = LOCAL_STORAGE.getIndexerAccount();
    var traderAAccount = LOCAL_STORAGE.getTraderAAccount();
    var traderBAccount = LOCAL_STORAGE.getTraderBAccount();
    if (!issuerAccount || !indexerAccount || !traderAAccount || !traderBAccount) {
        DEMO_UTIL.confirmDialog(
            demoMsg('issue.dialog.err-no-account.title'),
            demoMsg('issue.dialog.err-no-account.msg'),
            function() {
                if (DEMO_UTIL.isLoading()) return;
                $(this).dialog("close");
                if (!DEMO_UTIL.startLoad()) return;

                DEMO_UTIL.startLoad();
                registerAccount(issuerAccount, function(_account) {
                    LOCAL_STORAGE.setIssuerAccount(_account);
                    registerAccount(indexerAccount, function(_account) {
                        LOCAL_STORAGE.setIndexerAccount(_account);
                        registerAccount(traderAAccount, function(_account) {
                            LOCAL_STORAGE.setTraderAAccount(_account);
                            registerAccount(traderBAccount, function(_account) {
                                LOCAL_STORAGE.setTraderBAccount(_account);
                                DEMO_UTIL.stopLoad();
                                window.location.href = './issue.html';
                            });
                        });
                    });
                });
            },
            function() {
                window.location.href = './index.html';
            }
        );
        return;
    }

    var tokens = LOCAL_STORAGE.getTokens();
    if (!tokens) {
        tokens = {};
        LOCAL_STORAGE.setTokens(tokens);
    }

    var tokenRow = [];
    for (var tokenAddr in tokens) {
        tokenRow.push({addr: tokenAddr, token:tokens[tokenAddr]});
    }
    tokenRow.sort(function(a, b) {
        return a.token.simbol > b.token.simbol;
    });
    tokenRow.forEach(function(obj, idx, array) {
        if (obj.token.erc721) $('#erc721-list-area').css('display', 'block');
        else $('#token-list-area').css('display', 'block');
        appendToken(obj.addr, obj.token);
    });
    for (var i = 0; i < tokenRow.length; i++) {
    }
    $('#token-area').css('display', 'block');
});

var registerAccount = function(account, callback) {
    if (account) {
        callback(account);
        return;
    }
    ETH_UTIL.generateNewAccount(function(_newAccount) {
        callback(_newAccount);
    });
};

var appendToken = function(tokenAddr, token) {
    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    var getBalanceCallback = function(err, res) {
            if (err) {
                console.error(err);
                alert('Failed to get Token balance information.');
                return;
            }

            var tokenRow = $('#token-row-template div:first').clone(true);
            var traders = tokenRow.find('select[name="to-address"]');
            traders.append($('<option>').val(
                LOCAL_STORAGE.getTraderAAccount().getAddress()).text(demoMsg('common.caption.trader.a')));
            traders.append($('<option>').val(
                LOCAL_STORAGE.getTraderBAccount().getAddress()).text(demoMsg('common.caption.trader.b')));
            tokenRow.find('input[name="token-address"]').val(tokenAddr);
            tokenRow.find('div[name="token-symbol"]').text(token.symbol);
            tokenRow.find('div[name="token-name"]').text(token.name);
            tokenRow.find('div[name="balance"]').text(res.toString(10));
            if (!token.erc721) {
                $('#token-list').append(tokenRow);
                tokenRow.find('#erc20-form').css('display', 'block');
                return;
            }
            $('#erc721-list').append(tokenRow);
            tokenRow.find('button[name="create-erc721-button"]').css('display', 'block');
            tokenRow.find('#erc721-form').css('display', 'block');
            var getERC721TokenCallback = function(err, res) {
                if (err) {
                    console.error(err);
                    alert('Failed to get Tokens.');
                    return;
                }
                var tokenIds = tokenRow.find('select[name="token-id"]');
                res[0].forEach(function(r) {
                    tokenIds.append($('<option>').val(r.toString(10)).text(r.toString(10)));
                });
            };
            contract.call('', 'SwapTrade', 'getERC721Tokens', [tokenAddr, LOCAL_STORAGE.getIssuerAccount().getAddress()], SWAP_TRADE_ABI, getERC721TokenCallback);
        };
    var getBalanceFunction = token.erc721? 'getERC721Balance' : 'getBalance';
    contract.call('', 'SwapTrade', getBalanceFunction, [tokenAddr, LOCAL_STORAGE.getIssuerAccount().getAddress()], SWAP_TRADE_ABI, getBalanceCallback);
};

var createERC721Token = function(button) {
    if (DEMO_UTIL.isLoading()) return;

    var row = $(button.closest('div[name="token-row"]'));
    var tokenAddress = row.find('input[name="token-address"]').val().trim();

    // validate(very simple for DEMO)
    if (!tokenAddress) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-required.title'),
            demoMsg('issue.dialog.err-required.msg')
        );
        return;
    }

    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    DEMO_UTIL.confirmDialog(
        demoMsg("issue.dialog.create-one-token-confirm.title"),
        demoMsg("issue.dialog.create-one-token-confirm.msg"),
        function() {
            $(this).dialog("close");
            if (!DEMO_UTIL.startLoad()) return;

            contract.call('', 'Demo', 'getNonce', [tokenAddress, LOCAL_STORAGE.getIssuerAccount().getAddress()], DEMO_ABI,
                function(err, res) {
                    // get nonce
                    if (err) {
                        console.error(err);
                        alert('Failed to get Token nonce information.');
                        return DEMO_UTIL.stopLoad();
                    }

                    console.log(res);
                    var nonce = res.toString(10);
                    LOCAL_STORAGE.getIssuerAccount().sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'uint', 'uint'], [tokenAddress, 'createWithSign', 1, nonce]),
                        function(err, sign) {
                            // sign request
                            if (err) {
                                console.error(err);
                                alert('Failed to sign oarams.');
                                return DEMO_UTIL.stopLoad();
                            }
                            contract.sendTransaction('', 'Demo', 'createERC721Token', [tokenAddress, 1, nonce, sign], DEMO_ABI,
                                // send token
                                function(err, res) {
                                    if (err) {
                                        console.error(err);
                                        alert('Failed to sennd Token.');
                                        return DEMO_UTIL.stopLoad();
                                    }

                                    console.log(res);
                                    DEMO_UTIL.okDialog(
                                        demoMsg("issue.dialog.create-one-token-complete.title"),
                                        demoMsg("issue.dialog.create-one-token-complete.msg"),
                                        function() {
                                            window.location.href = './issue.html';
                                        }
                                    );
                                    return DEMO_UTIL.stopLoad();
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

/* send token */
var sendToken = function (button) {
    if (DEMO_UTIL.isLoading()) return;

    var row = $(button.closest('div[name="token-row"]'));
    var tokenAddress = row.find('input[name="token-address"]').val().trim();
    var toAddress = row.find('select[name="to-address"]').val().trim();
    var amount = row.find('input[name="amount"]').val().trim();

    // validate(very simple for DEMO)
    if (!tokenAddress || !toAddress || !amount) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-required.title'),
            demoMsg('issue.dialog.err-required.msg')
        );
        return;
    }
    if (!amount.match(/[1-9][0-9]{0,17}/)) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-invalid-amount.title'),
            demoMsg('issue.dialog.err-invalid-amount.msg')
        );
        return;
    }

    // send
    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    DEMO_UTIL.confirmDialog(
        demoMsg("issue.dialog.send-confirm.title"),
        demoMsg("issue.dialog.send-confirm.msg"),
        function() {
            $(this).dialog("close");
            if (!DEMO_UTIL.startLoad()) return;

            contract.call('', 'Demo', 'getNonce', [tokenAddress, LOCAL_STORAGE.getIssuerAccount().getAddress()], DEMO_ABI,
                function(err, res) {
                    // get nonce
                    if (err) {
                        console.error(err);
                        alert('Failed to get Token nonce information.');
                        return DEMO_UTIL.stopLoad();
                    }

                    console.log(res);
                    var nonce = res.toString(10);
                    LOCAL_STORAGE.getIssuerAccount().sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'address', 'uint', 'uint'], [tokenAddress, 'transferWithSign', toAddress, amount, nonce]),
                        function(err, sign) {
                            // sign request
                            if (err) {
                                console.error(err);
                                alert('Failed to sign oarams.');
                                return DEMO_UTIL.stopLoad();
                            }
                            contract.sendTransaction('', 'Demo', 'send', [tokenAddress, toAddress, amount, nonce, sign], DEMO_ABI,
                                // send token
                                function(err, res) {
                                    if (err) {
                                        console.error(err);
                                        alert('Failed to sennd Token.');
                                        return DEMO_UTIL.stopLoad();
                                    }

                                    console.log(res);
                                    DEMO_UTIL.okDialog(
                                        demoMsg("issue.dialog.send-complete.title"),
                                        demoMsg("issue.dialog.send-complete.msg"),
                                        function() {
                                            window.location.href = './issue.html';
                                        }
                                    );
                                    return DEMO_UTIL.stopLoad();
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

var sendERC721Token = function (button) {
    if (DEMO_UTIL.isLoading()) return;

    var row = $(button.closest('div[name="token-row"]'));
    var tokenAddress = row.find('input[name="token-address"]').val().trim();
    var toAddress = row.find('#erc721-form').find('select[name="to-address"]').val().trim();
    var tokenId = row.find('#erc721-form').find('select[name="token-id"]').val().trim();

    // validate(very simple for DEMO)
    if (!tokenAddress || !toAddress || !tokenId) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-required.title'),
            demoMsg('issue.dialog.err-required.msg')
        );
        return;
    }

    // send
    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    DEMO_UTIL.confirmDialog(
        demoMsg("issue.dialog.send-confirm.title"),
        demoMsg("issue.dialog.send-confirm.msg"),
        function() {
            $(this).dialog("close");
            if (!DEMO_UTIL.startLoad()) return;

            contract.call('', 'Demo', 'getNonce', [tokenAddress, LOCAL_STORAGE.getIssuerAccount().getAddress()], DEMO_ABI,
                function(err, res) {
                    // get nonce
                    if (err) {
                        console.error(err);
                        alert('Failed to get Token nonce information.');
                        return DEMO_UTIL.stopLoad();
                    }

                    console.log(res);
                    var nonce = res.toString(10);
                    LOCAL_STORAGE.getIssuerAccount().sign('', ethClient.utils.hashBySolidityType(['address', 'bytes32', 'address', 'uint', 'uint'], [tokenAddress, 'transferWithSign', toAddress, tokenId, nonce]),
                        function(err, sign) {
                            // sign request
                            if (err) {
                                console.error(err);
                                alert('Failed to sign oarams.');
                                return DEMO_UTIL.stopLoad();
                            }
                            contract.sendTransaction('', 'Demo', 'sendERC721Token', [tokenAddress, toAddress, tokenId, nonce, sign], DEMO_ABI,
                                // send token
                                function(err, res) {
                                    if (err) {
                                        console.error(err);
                                        alert('Failed to sennd Token.');
                                        return DEMO_UTIL.stopLoad();
                                    }

                                    console.log(res);
                                    DEMO_UTIL.okDialog(
                                        demoMsg("issue.dialog.send-complete.title"),
                                        demoMsg("issue.dialog.send-complete.msg"),
                                        function() {
                                            window.location.href = './issue.html';
                                        }
                                    );
                                    return DEMO_UTIL.stopLoad();
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

/* create token */
var createToken = function() {
    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    var tokenSymbol = $('#token-symbol').val().trim();
    var tokenName = $('#token-name').val().trim();
    var tokenSupply = $('#token-supply').val().trim();

    // validate(very simple for DEMO)
    if (!tokenSymbol || !tokenName || !tokenSupply) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-required.title'),
            demoMsg('issue.dialog.err-required.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    var tokenNameHex = ETH_UTIL.fromUtf8(tokenName);
    if (tokenNameHex.length > 66) {
        DEMO_UTIL.okDialog(
            demoMsg("issue.dialog.err-token-name-too-long.title"),
            demoMsg("issue.dialog.err-token-name-too-long.msg")
        );
        return DEMO_UTIL.stopLoad();
    }
    var tokenSymbolHex = ETH_UTIL.fromUtf8(tokenName);
    if (tokenSymbolHex.length > 66) {
        alert('token symbole length is too long');
        return;
    }
    if (!tokenSupply.match(/[1-9][0-9]{0,17}/)) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-invalid-supply.title'),
            demoMsg('issue.dialog.err-invalid-supply.msg')
        );
        return DEMO_UTIL.stopLoad();
    }

    // create
    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    contract.sendTransaction('', 'Demo', 'createToken', [tokenSymbolHex, tokenNameHex, tokenSupply], DEMO_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                alert('error! check console!');
                return DEMO_UTIL.stopLoad();
            }
            console.log(res);
            var getTokenContractAddress = function(txHash, callback) {
                contract.getTransactionReceipt(txHash, function(err, res) {
                    if (err) callback(err);
                    else if (res) callback(null, '0x' + res.logs[0].data.substr(-40));
                    else setTimeout(function() { getTokenContractAddress(txHash, callback); }, 5000);
                });
            };
            getTokenContractAddress(res, function(err, tokenAddr) {
                console.log(tokenAddr);
                var tokens = LOCAL_STORAGE.getTokens();
                tokens[tokenAddr] = {
                    symbol: tokenSymbol,
                    name: tokenName
                };
                LOCAL_STORAGE.setTokens(tokens);
                DEMO_UTIL.okDialog(
                    demoMsg("issue.dialog.token-created.title"),
                    demoMsg("issue.dialog.token-created.msg"),
                    function() {
                        window.location.href = './issue.html';
                    }
                );
                return DEMO_UTIL.stopLoad();
            });
        }
    );
};

var createERC721TokenContract = function() {
    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    var tokenSymbol = $('#erc721-symbol').val().trim();
    var tokenName = $('#erc721-name').val().trim();

    // validate(very simple for DEMO)
    if (!tokenSymbol || !tokenName) {
        DEMO_UTIL.okDialog(
            demoMsg('issue.dialog.err-required.title'),
            demoMsg('issue.dialog.err-required.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    var tokenNameHex = ETH_UTIL.fromUtf8(tokenName);
    if (tokenNameHex.length > 66) {
        DEMO_UTIL.okDialog(
            demoMsg("issue.dialog.err-token-name-too-long.title"),
            demoMsg("issue.dialog.err-token-name-too-long.msg")
        );
        return DEMO_UTIL.stopLoad();
    }
    var tokenSymbolHex = ETH_UTIL.fromUtf8(tokenName);
    if (tokenSymbolHex.length > 66) {
        alert('token symbole length is too long');
        return;
    }

    // create
    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIssuerAccount());
    contract.sendTransaction('', 'Demo', 'createERC721TokenContract', [tokenSymbolHex, tokenNameHex], DEMO_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                alert('error! check console!');
                return DEMO_UTIL.stopLoad();
            }
            console.log(res);
            var getTokenContractAddress = function(txHash, callback) {
                contract.getTransactionReceipt(txHash, function(err, res) {
                    if (err) callback(err);
                    else if (res) callback(null, '0x' + res.logs[0].data.substr(-40));
                    else setTimeout(function() { getTokenContractAddress(txHash, callback); }, 5000);
                });
            };
            getTokenContractAddress(res, function(err, tokenAddr) {
                console.log(tokenAddr);
                var tokens = LOCAL_STORAGE.getTokens();
                tokens[tokenAddr] = {
                    erc721: 1,
                    symbol: tokenSymbol,
                    name: tokenName
                };
                LOCAL_STORAGE.setTokens(tokens);
                DEMO_UTIL.okDialog(
                    demoMsg("issue.dialog.token-created.title"),
                    demoMsg("issue.dialog.token-created.msg"),
                    function() {
                        window.location.href = './issue.html';
                    }
                );
                return DEMO_UTIL.stopLoad();
            });
        }
    );
};