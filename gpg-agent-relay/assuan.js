"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssuanClient = void 0;
var net = require("net");
var util = require("util");
var path = require("path");
var fs = require("fs");
var AssuanClient = /** @class */ (function () {
    function AssuanClient(opts) {
        this._clientSocket = null;
        this._connected = false;
        this._isAssuan = false;
        this.path = opts.path;
    }
    Object.defineProperty(AssuanClient.prototype, "connected", {
        get: function () {
            return this._connected;
        },
        enumerable: false,
        configurable: true
    });
    AssuanClient.prototype.onRead = function (handler) {
        this._readHandler = handler;
    };
    AssuanClient.prototype.onClose = function (handler) {
        this._closeHandler = handler;
    };
    AssuanClient.prototype.onError = function (handler) {
        this._errorHandler = handler;
    };
    AssuanClient.prototype.connect = function () {
        var _this = this;
        var dest = path.resolve(this.path);
        if (!fs.existsSync(dest)) {
            return Promise.reject(new Error('Not exists'));
        }
        return util.promisify(fs.stat)(dest)
            .then(function (stat) {
            if (stat.isFile()) {
                return _this._connectInfoFileSocket(dest);
            }
            else {
                return _this._connectUnixDomainSocket(dest);
            }
        });
    };
    AssuanClient.prototype.close = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this._clientSocket) {
                _this._clientSocket.end(function () {
                    _this._clientSocket = null;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    };
    AssuanClient.prototype.write = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this._clientSocket) {
                _this._clientSocket.write(data, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                reject(new Error('Not connected'));
            }
        });
    };
    AssuanClient.prototype._connectSocket = function (socket) {
        var _this = this;
        this._clientSocket = socket;
        return new Promise(function (resolve, reject) {
            socket.on('connect', function () {
                _this._connected = true;
                if (_this._isAssuan) {
                    socket.write(_this._nonce, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                    return;
                }
                resolve();
            });
            socket.on('error', function (err) {
                if (_this._connected) {
                    _this._errorHandler(err);
                }
                else {
                    reject(err);
                }
            });
            socket.on('data', function (data) {
                var pause = !socket.isPaused();
                if (pause) {
                    socket.pause();
                }
                _this._readHandler(data)
                    .catch(function (err) {
                    _this._errorHandler(err);
                })
                    .finally(function () {
                    if (pause) {
                        socket.resume();
                    }
                });
            });
            socket.on('close', function () {
                _this._closeHandler();
                _this._clientSocket = null;
            });
        });
    };
    AssuanClient.prototype._connectInfoFileSocket = function (dest) {
        var _this = this;
        this._isAssuan = true;
        return util.promisify(fs.readFile)(dest)
            .then(function (fileBuffer) {
            var nlchar = '\n'.charCodeAt(0);
            var linePos = fileBuffer.findIndex(function (v) { return v === nlchar; });
            var portPart = fileBuffer.slice(0, linePos).toString('ascii');
            var noncePart = fileBuffer.slice(linePos + 1);
            _this._nonce = noncePart;
            var s = net.createConnection({
                host: 'localhost',
                port: parseInt(portPart)
            });
            return _this._connectSocket(s);
        });
    };
    AssuanClient.prototype._connectUnixDomainSocket = function (dest) {
        var s = net.createConnection({
            path: this.path
        });
        return this._connectSocket(s);
    };
    AssuanClient.create = function (opts) {
        return new AssuanClient(opts);
    };
    return AssuanClient;
}());
exports.AssuanClient = AssuanClient;
//# sourceMappingURL=assuan.js.map