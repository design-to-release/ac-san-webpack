"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.merge = merge;
var _promises = require("fs/promises");
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _path1 = require("path");
var _url = require("url");
function _classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver).value;
}
function _classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    var descriptor = privateMap.get(receiver);
    if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
    return value;
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const NewLine = '\r\n';
class Path {
    toString() {
        return _classPrivateFieldGet(this, _path2);
    }
    constructor(path, isRemote1 = false){
        _path2.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _path2, path);
        this.isRemote = isRemote1;
    }
}
var _path2 = new WeakMap();
async function merge(parent, paths) {
    const resolvedPaths = resolvePaths(parent, paths);
    const tasks = [];
    for (const i of resolvedPaths){
        tasks.push(loadStyleSheet(i));
    }
    return (await Promise.all(tasks)).join(NewLine);
}
async function loadStyleSheet(path1) {
    if (path1.isRemote) {
        const resp = await (0, _nodeFetch).default(path1.toString());
        return resp.text();
    }
    return (await (0, _promises).readFile(path1.toString())).toString();
}
function resolvePaths(parent, paths) {
    return paths.map((curr)=>{
        if (isRemote2(curr)) {
            return new Path(curr, true);
        } else if ((0, _path1).isAbsolute(curr)) {
            return new Path(curr);
        }
        return new Path((0, _path1).join(parent, curr));
    });
}
function isRemote2(s) {
    let url;
    try {
        url = new _url.URL(s);
    } catch  {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}
