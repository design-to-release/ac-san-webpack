"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolve = resolve;
function resolve(cfg) {
    const { css ={
    }  } = cfg;
    return {
        css: resolveCSSConfig(css)
    };
}
function resolveCSSConfig(cfg) {
    const { paths =[] , treeShaking =true  } = cfg;
    return {
        paths,
        treeShaking
    };
}
