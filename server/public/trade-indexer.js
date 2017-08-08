$(document).ready(function() {

    var issuerAccount = LOCAL_STORAGE.getIssuerAccount();
    var indexerAccount = LOCAL_STORAGE.getIndexerAccount();
    var traderAAccount = LOCAL_STORAGE.getTraderAAccount();
    var traderBAccount = LOCAL_STORAGE.getTraderBAccount();
    if (!issuerAccount || !indexerAccount || !traderAAccount || !traderBAccount) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-no-account.title'),
            demoMsg('trade.dialog.err-no-account.msg'),
            function() {
                window.location.href = './issue.html';
            }
        );
        return;
    }

    var tokens = LOCAL_STORAGE.getTokens();
    if (Object.keys(tokens).length < 2) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-lack-token.title'),
            demoMsg('trade.dialog.err-lack-token.msg'),
            function() {
                window.location.href = './issue.html';
            }
        );
        return;
    }
    var condition = LOCAL_STORAGE.getCondition();
    if (!condition) condition = {};

    var traders = $('#trader-address');
    traders.append(option(LOCAL_STORAGE.getTraderAAccount().getAddress(), demoMsg('common.caption.trader.a'), condition.trader));
    traders.append(option(LOCAL_STORAGE.getTraderBAccount().getAddress(), demoMsg('common.caption.trader.b'), condition.trader));

    if (!tokens) {
        tokens = {};
        LOCAL_STORAGE.setTokens(tokens);
    }

    var from = $('#token-from');
    var to = $('#token-to');
    for (var tokenAddr in tokens) {
        from.append(option(tokenAddr, tokens[tokenAddr].symbol, condition.from));
        to.append(option(tokenAddr, tokens[tokenAddr].symbol, condition.to));
    }

    changeCondition();
});

var option = function(value, msg, selectedValue) {
    return $('<option>').val(value).text(msg).prop('selected', (value == selectedValue));
};

/* check condition */
var changeCondition = function() {
    // reset values
    $('#price').val('');
    $('#amount').val('');
    $('#from-token-symbol').text('');
    $('#from-token-you-have').text('');
    $('#from-token-allowance-input').val('');
    $('#from-token-allowance').text('');
    $('#from-token-on-order').text('');
    $('#from-token-tradable').text('');
    $('#to-token-symbol').text('');
    $('#to-token-you-have').text('');
    $('#to-token-allowance-input').val('');
    $('#to-token-allowance').text('');
    $('#to-token-on-order').text('');
    $('#to-token-tradable').text('');

    // get conditions
    var trader = $('#trader-address').val();
    var tokenFrom = $('#token-from').val();
    var tokenTo = $('#token-to').val();

    LOCAL_STORAGE.setCondition({trader: trader, from: tokenFrom, to: tokenTo});

    if (!trader || !tokenFrom || !tokenTo || tokenFrom === tokenTo) {
        $('#token-area').css('display', 'none');
        return;
    }

    // refresh view
    var from = $('#token-from option:selected').text();
    var to = $('#token-to option:selected').text();
    $('#sell-title-token').text(from);
    $('#title-from').text(from);
    $('#title-to').text(to);
    $('#title-sum-to').text('Sum(' + to + ')');
    $('#sell-row-template').find('div[name="from-token-symbol"]').text(from);
    $('#sell-row-template').find('div[name="to-token-symbol"]').text(to);

    // get possessions
    $('#from-token-symbol').text(from);
    $('#to-token-symbol').text(to);

    getPossessionData([trader], function(result) {
        var possessions = result[trader];
        $('#from-token-you-have').text(possessions.from.balance);
        $('#from-token-allowance-input').val(possessions.from.allowance);
        $('#from-token-allowance').text(possessions.from.allowance);
        $('#from-token-on-order').text(possessions.from.onorder);
        $('#from-token-tradable').text(possessions.from.tradable);
        $('#to-token-you-have').text(possessions.to.balance);
        $('#to-token-allowance-input').val(possessions.to.allowance);
        $('#to-token-allowance').text(possessions.to.allowance);
        $('#to-token-on-order').text(possessions.to.onorder);
        $('#to-token-tradable').text(possessions.to.tradable);
    });

    // board
    refreshSellOrders();

    $('#token-area').css('display', 'block');
};

/* refresh board */
var refreshSellOrders = function() {
    var trader = $('#trader-address').val();

    // clear
    var titleRow = $('#board div:first');
    var board = $('#board');
    board.empty();
    board.append(titleRow);

    // find
    var tokenFrom = $('#token-from').val();
    var tokenTo = $('#token-to').val();
    var board = LOCAL_STORAGE.getBoard();
    if (!board) board = [];
    var rows = [];
    board.forEach(function(record, idx, b) {
        if (tokenFrom == record.from && tokenTo == record.to) {
            rows.push(record);
        }
    });

    // add board
    rows.forEach(function(row, idx, b) {
        row.price = new BigNumber(row.price);
    });
    rows.sort(function(a, b) {
        return a.price.eq(b.price) ? a.time < b.time : a.price.gt(b.price);
    });
    for (var i = 0; i < rows.length; i++) {
        appendSellRecord(trader, rows[i]);
    }
};

var appendSellRecord = function(trader, r) {

    var row = $('#sell-row-template div:first').clone(true);
    if (r.maker == trader) {
        row.find('input').prop('disabled', true);
        row.find('button[name=trade]').css('display', 'none');
        row.find('button[name=cancel]').css('display', 'block');
    }
    row.find('div[name="sell-price"]').text(r.price);
    row.find('div[name="sell-remain"]').text(r.remain);
    row.find('div[name="sell-to"]').text(r.price.times(r.remain));
    row.find('input[name="record-id"]').val(r.recordId);
    row.find('input[name="maker-address"]').val(r.maker);
    row.find('input[name="price"]').val(r.price);
    row.find('input[name="amount"]').val(r.amount);
    row.find('input[name="remain"]').val(r.remain);
    $('#board').append(row);
};

/* cancel record */
var cancelRecord = function(obj) {

    // cancel record
    // on actual service this should do strictry auth check.
    var row = $(obj).closest('div.row');
    var recordId = row.find('input[name="record-id"]').val();
    removeRecord(recordId);
};

var removeRecord = function(recordId) {
    // cancel record
    console.log(recordId);
    var board = LOCAL_STORAGE.getBoard();
    if (!board) board = [];
    board.forEach(function(record, idx, b) {
        if (record.recordId == recordId) {
            b.splice(idx,1);
            return true;
        }
    });
    LOCAL_STORAGE.setBoard(board);
    changeCondition();
};


/* allowance */
var allowance = function(fromTo) {
    if (DEMO_UTIL.isLoading()) return;

    DEMO_UTIL.inputDialog(
        demoMsg('trade.form.set-allowance.title'),
        $('#' + fromTo + '-token-allowance-input').val(),
        function() {

            var tokenAddress;
            if (fromTo == 'from') {
                tokenAddress = $('#token-from').val();
            } else {
                tokenAddress = $('#token-to').val();
            }

            var amount = toBigNumberById('#dialog-input');
            if (!amount.isFinite() || amount.lte(0)) {
                DEMO_UTIL.okDialog(
                    demoMsg('trade.dialog.err-not-number.title'),
                    demoMsg('trade.dialog.err-not-number.msg')
                );
                return;
            }
            var onOrder = calcOnOrder($('#trader-address').val(), tokenAddress);
            if (amount.lt(onOrder)) {
                DEMO_UTIL.okDialog(
                    demoMsg('trade.dialog.err-allowance-short.title'),
                    demoMsg('trade.dialog.err-allowance-short.msg')
                );
                return;
            }

            // goto trade-trader.js
            $(this).dialog("close");
            if (!DEMO_UTIL.startLoad()) return;
            allowanceSign(tokenAddress, amount);
        }
    );
};
var allowanceSignAccept = function() {
    changeCondition();
    DEMO_UTIL.okDialog(
        demoMsg('trade.dialog.allowance-complete.title'),
        demoMsg('trade.dialog.allowance-complete.msg')
    );
    return DEMO_UTIL.stopLoad();
};
var allowanceSignReject = function(err) {
    console.error(err);
    alert('Failed to set allowance. check console.')
    return DEMO_UTIL.stopLoad();
};

/* adjust sell values */
var changePrice = function() {
    var v = getSellValues();
    if (v.price.isFinite() && v.amount.isFinite()) {
        var total = v.price.times(v.amount);
        if (toBigNumberById('#total').equals(total)) return;
        $('#total').val(total);
    } else {
        $('#total').val('');
    }
};
var changeAmount = function() {
    changePrice();
};
var changeTarget = -1;
var focusTotal = function() {
    var v = getSellValues();
    changeTarget = (v.price.isFinite()) ? 1 : ((v.amount.isFinite()) ? 0 : -1);
};
var changeTotal = function() {
    if ($('#total').val() == '' || changeTarget == -1) return;

    var v = getSellValues();

    if (changeTarget == 0) {
        // price
        var price = v.total.div(v.amount);
        if (toBigNumberById('#price').equals(price)) return;
        $('#price').val(price);
    } else {
        var amount = v.total.div(v.price);
        if (toBigNumberById('#amount').equals(amount)) return;
        $('#amount').val(amount);
    }
};
var blurTotal = function() {
    changeTarget = -1;
};
var getSellValues = function() {
    return {
        price:toBigNumberById('#price'),
        amount:toBigNumberById('#amount'),
        total:toBigNumberById('#total')
    };
};
var toBigNumberById = function(id) {
    return toBigNumber($(id).val().trim());
};
var toBigNumber = function(val) {
    try {
        return new BigNumber(val);
    } catch (e) {
        return new BigNumber(NaN);
    }
};

/* sell token */
var sell = function() {
    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    var tokenFrom = $('#token-from').val();
    var tokenTo = $('#token-to').val();
    var price = $('#price').val().trim();
    var amount = $('#amount').val().trim();

    // very rough validation for demo
    if (price == "" || amount == "") {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-required.title'),
            demoMsg('trade.dialog.err-required.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    var priceNum = toBigNumber(price);
    var amountNum = toBigNumber(amount);
    if (!(priceNum.isFinite() && amountNum.isFinite() && priceNum.gt(0) && amountNum.gt(0))) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-not-number.title'),
            demoMsg('trade.dialog.err-not-number.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    if (!(amountNum.isInt())) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-not-int.title'),
            demoMsg('trade.dialog.err-not-int.msg')
        );
        return DEMO_UTIL.stopLoad();
    }

    // The indexer should record the maker's contact information (address, ip ...) at or before this timing.
    // For demonstration, it is completed by function call.

    // to trade-trader.js
    sellSign(tokenFrom, tokenTo, price, amount);
};

// callback from maker (trade-trader.js)
var sellSignAccept = function(tokenFrom, tokenTo, price, amount, sign) {

    // check and get maker's sign
    var hash = ethClient.utils.hashBySolidityType(
        ['address', 'address', 'uint', 'uint'],
        [tokenFrom, tokenTo, price, amount]
    );
    var traderAddress = ethClient.utils.recoverAddress(hash, sign);
    console.log(traderAddress);

    // check trader's allowance
    getPossessionTokenData(traderAddress, tokenFrom, function(token) {
        if (new BigNumber(amount).gt(new BigNumber(token.tradable))){
            DEMO_UTIL.okDialog(
                demoMsg('trade.dialog.err-tradable-shortage.title'),
                demoMsg('trade.dialog.err-tradable-shortage.msg')
            );
            return DEMO_UTIL.stopLoad();
        }

        var board = LOCAL_STORAGE.getBoard();
        if (!board) board = [];
        var recordId = LOCAL_STORAGE.getBoardNextId();
        board.push({recordId:recordId, time:Date.now(), maker:traderAddress, from:tokenFrom, to:tokenTo, price:price, amount:amount, remain:amount});
        LOCAL_STORAGE.setBoard(board);


        $('#price').val("");
        $('#amount').val("");
        $('#total').val("");
        changeCondition();

        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.trade-info-written.title'),
            demoMsg('trade.dialog.trade-info-written.msg')
        );
        return DEMO_UTIL.stopLoad();
    });

};

/* adjust buy values */
var adjustByAmount = function(obj) {

    obj = $(obj);
    var row = obj.closest('div.row');
    var amount = toBigNumber(obj.val().trim());
    var price = toBigNumber(row.find('input[name="price"]').val());
    var targetDiv = row.find('div[name="to-token-volume"]');

    console.log(amount.toString());
    console.log(price.toString());

    if (!amount.isFinite() || amount.lt(0)) {
        targetDiv.text('------');
        return;
    }
    // In the case of decimal places, the price will be rounded up so that the price will be slightly higher
    targetDiv.text(amount.times(price).round());

};


/* trade */
var trade = function(button) {
    if (DEMO_UTIL.isLoading()) return;
    if (!DEMO_UTIL.startLoad()) return;

    // very rough validation (just for DEMO)
    var row = $(button.closest('div[name="sell-row"]'));
    var recordId = parseInt(row.find('input[name="record-id"]').val());
    var amount = toBigNumber(row.find('input[name="buy-amount"]').val().trim());
    if (!amount.isFinite() || amount.lte(0)) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-not-number.title'),
            demoMsg('trade.dialog.err-not-number.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    if (!(amount.isInt())) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-not-int.title'),
            demoMsg('trade.dialog.err-not-int.msg')
        );
        return DEMO_UTIL.stopLoad();
    }
    var remain = toBigNumber(row.find('input[name="remain"]').val());
    if (amount.gt(remain)) {
        DEMO_UTIL.okDialog(
            demoMsg('trade.dialog.err-over-remain.title'),
            demoMsg('trade.dialog.err-over-remain.msg')
        );
        return DEMO_UTIL.stopLoad();
    }

    // Actually this should check more and more.
    //TODO if not demo

    var _price = row.find('input[name="price"]').val();

    var _makerAddress = row.find('input[name="maker-address"]').val();
    var _makerTokenAddr = $('#token-from').val();
    var _makerAmount = amount.toString();
    var _takerTokenAddr = $('#token-to').val();
    var _takerAmount = amount.times(toBigNumber(_price)).round().toString();

    // check maker's allowance
    getPossessionTokenData(_makerAddress, _makerTokenAddr, function(token) {
        var balance = new BigNumber(token.balance);
        var allowance = new BigNumber(token.allowance);
        var sellLimit = (allowance.lt(balance)) ? allowance : balance;
        if (new BigNumber(_makerAmount).gt(sellLimit)){
            DEMO_UTIL.okDialog(
                demoMsg('trade.dialog.err-tradable-maker-shortage.title'),
                demoMsg('trade.dialog.err-tradable-maker-shortage.msg')
            );
            removeRecord(recordId);
            return DEMO_UTIL.stopLoad();
        }

        // goto trade-trader.js
        tradeTakerSign(recordId, _makerAddress, _makerTokenAddr, _makerAmount, _takerTokenAddr, _takerAmount);
    });
};

// callback from trade-trader.js
var tradeTakerSignAccept = function (recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign) {

    var hash = ethClient.utils.hashBySolidityType(
        ['address', 'bytes32', 'address', 'uint', 'address', 'address', 'uint', 'uint', 'uint'],
        [TOKEN_TRADER_ADDRESS, 'trade', makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce]
    );
    var takerAddress = ethClient.utils.recoverAddress(hash, takerSign);
    console.log(takerAddress);

    // check taker's allowance
    getPossessionTokenData(takerAddress, takerTokenAddr, function(token) {
        if (new BigNumber(takerAmount).gt(new BigNumber(token.tradable))){
            DEMO_UTIL.okDialog(
                demoMsg('trade.dialog.err-tradable-taker-shortage.title'),
                demoMsg('trade.dialog.err-tradable-taker-shortage.msg')
            );
            return DEMO_UTIL.stopLoad();
        }

        // goto trade-trader.js again
        tradeMakerSign(recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign);
    });
};

// callback again from trade-trader.js
var tradeMakerSignAccept = function (recordId, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign, makerSign) {

    // If necessary, Indexer checks the values.

    var indexerAccount = LOCAL_STORAGE.getIndexerAccount();
    var contract = ETH_UTIL.getContract(indexerAccount);

    contract.sendTransaction(
        '', 'SwapTrade', 'trade',
        [TOKEN_TRADER_ADDRESS, makerTokenAddr, makerAmount, makerAddress, takerTokenAddr, takerAmount, expiration, tradeNonce, takerSign, makerSign],
        SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                DEMO_UTIL.okDialog(
                    demoMsg('trade.dialog.err-trade.title'),
                    demoMsg('trade.dialog.err-trade.msg')
                );
                return DEMO_UTIL.stopLoad();
            }

            // update remain
            var board = LOCAL_STORAGE.getBoard();
            if (!board) board = [];
            board.forEach(function(record, idx, b) {
                if (record.recordId == recordId) {
                    var remain = new BigNumber(record.remain).minus(new BigNumber(makerAmount));
                    if (remain.lte(new BigNumber(0))) {
                        b.splice(idx,1);
                    } else {
                        record.remain = remain.toString();
                    }
                    return true;
                }
            });
            LOCAL_STORAGE.setBoard(board);

            DEMO_UTIL.okDialog(
                demoMsg('trade.dialog.trade-complete.title'),
                demoMsg('trade.dialog.trade-complete.msg'),
                function() {
                    changeCondition();
                    $(this).dialog("close");
                }
            );
            return DEMO_UTIL.stopLoad();
        }
    );
};

// --- calc

var calcOnOrder = function(traderAddress, tokenAddress) {
    var board = LOCAL_STORAGE.getBoard();
    if (!board) return new BigNumber("0");
    var sum = new BigNumber(0);
    board.forEach(function(record, idx, b) {
        if (traderAddress == record.maker && tokenAddress == record.from) {
            sum = sum.add(new BigNumber(record.remain));
        }
    });
    return sum;
};

var calcTradable = function(token) {
    var balance = new BigNumber(token.balance);
    var allowance = new BigNumber(token.allowance);
    var onorder = new BigNumber(token.onorder);
    var remain = (balance.gt(allowance)) ? allowance : balance;
    return remain.minus(onorder);
};

var getPossessionData = function(traderAddresses, callback) {

    var tokenFrom = $('#token-from').val();
    var tokenTo = $('#token-to').val();
    var result = {};
    getPossessionDataLoop(result, 0, traderAddresses, tokenFrom, tokenTo, callback);
};

var getPossessionDataLoop = function(result, idx, traderAddresses, tokenFrom, tokenTo, callback) {

    if (idx >= traderAddresses.length) return callback(result);

    var traderAddress = traderAddresses[idx];
    result[traderAddress] = {};
    getPossessionTokenData(traderAddress, tokenFrom, function(token) {
        result[traderAddress].from = token;
        getPossessionTokenData(traderAddress, tokenTo, function(token) {
            result[traderAddress].to = token;
            getPossessionDataLoop(result, ++idx, traderAddresses, tokenFrom, tokenTo, callback);
        });
    });

};

var getPossessionTokenData = function(traderAddress, tokenAddress, callback) {

    var contract = ETH_UTIL.getContract(LOCAL_STORAGE.getIndexerAccount());

    var result = {};
    contract.call('', 'SwapTrade', 'getBalance', [tokenAddress, traderAddress], SWAP_TRADE_ABI,
        function(err, res) {
            if (err) {
                console.error(err);
                alert('Failed to get Token balance information.');
                return;
            }
            console.log(res);
            result.balance = res.toString(10);

           contract.call('', 'SwapTrade', 'getAllowance', [tokenAddress, traderAddress, TOKEN_TRADER_ADDRESS], SWAP_TRADE_ABI,
               function(err, res) {
                   if (err) {
                       console.error(err);
                       alert('Failed to get Token allowance information.');
                       return;
                   }

                   console.log(res);
                   result.allowance = res.toString(10);
                   result.onorder = calcOnOrder(traderAddress, tokenAddress).toString();
                   result.tradable = calcTradable(result);
                   callback(result);
               }
           );
        }
    );
};
