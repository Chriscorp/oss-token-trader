var LOCAL_STORAGE = {};

var _issuerAccountKey = 'token-trader.issuer';
var _indexerAccountKey = 'token-trader.indexer';
var _traderAAccountKey = 'token-trader.trader-a';
var _traderBAccountKey = 'token-trader.trader-b';
var _tokensKey = 'token-trader.tokens';
var _erc721TokensKey = 'token-trader.erc721Tokens';
var _conditionKey = 'token-trader.condition';
var _boardNextIdKey = 'token-trader.board.next-id';
var _boardKey = 'token-trader.board';
var _traderIpKey = 'token-trader.trader-ip';

LOCAL_STORAGE.getIssuerAccount = function () {
    var serializedAccount = localStorage.getItem(_issuerAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setIssuerAccount = function (_account) {
    localStorage.setItem(_issuerAccountKey, _account.serialize());
};
LOCAL_STORAGE.getIndexerAccount = function () {
    var serializedAccount = localStorage.getItem(_indexerAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setIndexerAccount = function (_account) {
    localStorage.setItem(_indexerAccountKey, _account.serialize());
};
LOCAL_STORAGE.getTraderAAccount = function () {
    var serializedAccount = localStorage.getItem(_traderAAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setTraderAAccount = function (_account) {
    localStorage.setItem(_traderAAccountKey, _account.serialize());
};
LOCAL_STORAGE.getTraderBAccount = function () {
    var serializedAccount = localStorage.getItem(_traderBAccountKey);
    return serializedAccount ? ethClient.Account.deserialize(serializedAccount) : null;
};
LOCAL_STORAGE.setTraderBAccount = function (_account) {
    localStorage.setItem(_traderBAccountKey, _account.serialize());
};
LOCAL_STORAGE.getTokens = function () {
    return JSON.parse(localStorage.getItem(_tokensKey));
};
LOCAL_STORAGE.setTokens = function (_jsonValue) {
    localStorage.setItem(_tokensKey, JSON.stringify(_jsonValue));
};
LOCAL_STORAGE.getERC721Tokens = function () {
    return JSON.parse(localStorage.getItem(_erc721TokensKey));
};
LOCAL_STORAGE.setERC721Tokens = function (_jsonValue) {
    localStorage.setItem(_erc721TokensKey, JSON.stringify(_jsonValue));
};
LOCAL_STORAGE.getCondition = function () {
    return JSON.parse(localStorage.getItem(_conditionKey));
};
LOCAL_STORAGE.setCondition = function (_jsonValue) {
    localStorage.setItem(_conditionKey, JSON.stringify(_jsonValue));
};
LOCAL_STORAGE.getBoardNextId = function () {
    var id = localStorage.getItem(_boardNextIdKey);
    if (!id) {
        id = 0;
    } else {
        id++;
    }
    localStorage.setItem(_boardNextIdKey, id);
    return id;
};
LOCAL_STORAGE.getBoard = function () {
    return JSON.parse(localStorage.getItem(_boardKey));
};
LOCAL_STORAGE.setBoard = function (_jsonValue) {
    localStorage.setItem(_boardKey, JSON.stringify(_jsonValue));
};
LOCAL_STORAGE.getTraderIp = function () {
    return JSON.parse(localStorage.getItem(_traderIpKey));
};
LOCAL_STORAGE.setTraderIp = function (_jsonValue) {
    localStorage.setItem(_traderIpKey, JSON.stringify(_jsonValue));
};
