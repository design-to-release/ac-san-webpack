import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { PluginConfig } from './config';
export declare const PluginSymbol: unique symbol;
export default class implements WebpackPluginInstance {
    #private;
    get cssCfg(): Required<import("./config").PluginCSSConfig>;
    constructor(cfg: PluginConfig);
    apply(compiler: Compiler): void;
}
