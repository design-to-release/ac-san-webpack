"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PluginSymbol = exports.default = void 0;
var _postcss = require("postcss");
var _config = require("./config");
var _css = require("./css");
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
const PluginName = 'ac-san-webpack-plugin';
const PluginSymbol = Symbol(PluginName);
exports.PluginSymbol = PluginSymbol;
class _class {
    get cssCfg() {
        return _classPrivateFieldGet(this, _cfg).css;
    }
    apply(compiler) {
        const normalModule = compiler.webpack.NormalModule;
        const adoptedClasses = new Set();
        compiler.hooks.thisCompilation.tap(PluginName, async (compilation)=>{
            const normalModuleLoader = normalModule.getCompilationHooks(compilation).loader;
            normalModuleLoader.tap(PluginName, (loaderContext)=>{
                loaderContext[PluginSymbol] = {
                    adoptedClasses
                };
            });
            const content = await (0, _css).merge(compiler.context, this.cssCfg.paths);
            const ast = (0, _postcss).parse(content);
            ast.walkRules((rule)=>{
                if (rule.selector[0] === '.' && !adoptedClasses.has(rule.selector.slice(1))) {
                    rule.remove();
                }
            });
            const { ConcatSource  } = compiler.webpack.sources;
            const source = new ConcatSource(content);
            compilation.hooks.renderManifest.tap(PluginName, (result, { chunk  })=>{
                result.push({
                    render: ()=>source
                    ,
                    filenameTemplate: '[name].css',
                    pathOptions: {
                        chunk
                    },
                    identifier: `${PluginName}.${chunk.id}`
                });
                return result;
            });
        });
    }
    constructor(cfg){
        _cfg.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _cfg, (0, _config).resolve(cfg));
    }
}
var _cfg = new WeakMap();
exports.default = _class;
