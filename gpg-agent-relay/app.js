"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var path = require("path");
var assuan_1 = require("./assuan");
function parseBool(s, def) {
    var _def = def || false;
    if (!s) {
        return _def;
    }
    if (/true|1|yes/i.exec(s)) {
        return true;
    }
    if (/false|0|no/i.exec(s)) {
        return false;
    }
    return _def;
}
var defaultGpgAgentSock = path.join(process.env.APPDATA, 'gnupg/S.gpg-agent.extra');
var GPG_AGENT_SOCK = process.env.GPG_AGENT_SOCK || defaultGpgAgentSock;
var LISTEN_PORT = parseInt(process.env.LISTEN_PORT || '31000');
var server = net.createServer();
server.on('connection', function (socket) {
    console.log("Client[" + socket.remoteAddress.toString() + "] connected");
    var client = assuan_1.AssuanClient.create({
        path: GPG_AGENT_SOCK
    });
    socket.on('data', function (data) {
        client.write(data);
    });
    socket.on('close', function () {
        console.log("Client[" + socket.remoteAddress.toString() + "] closed");
        client.close();
    });
    socket.on('error', function (err) {
        console.error("Client[" + socket.remoteAddress.toString() + "] error", err);
    });
    client.onRead(function (data) {
        return new Promise(function (resolve, reject) {
            socket.write(data, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
    client.onClose(function () { return new Promise(function (resolve, reject) {
        socket.end(function () {
            resolve();
        });
    }); });
    client.onError(function (err) {
        console.error(err);
    });
    client.connect();
});
server.on('error', function (err) {
    console.error('LISTEN SOCKET ERROR!', err);
    process.exit(2);
});
server.on('listening', function () {
    console.log('Server started!');
    console.log(" gpg-agent socket : " + GPG_AGENT_SOCK);
    console.log(" listen port      : " + LISTEN_PORT);
});
server.listen(LISTEN_PORT);
//# sourceMappingURL=app.js.map