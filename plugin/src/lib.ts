import type { Compiler, WebpackPluginInstance, NormalModule } from 'webpack';
import type { PluginConfig } from './config';
import type { PartialOrRequired, RL } from './utility-types';

import { resolve as resolveConfig } from './config';
import { merge as mergeStyleSheets } from './css';

const ID = 'ac-san-webpack-plugin';
const NS = 'ac-san-webpack';

class Plugin implements WebpackPluginInstance {

  #cfg: Required<PartialOrRequired<PluginConfig, RL>>;

  get cssCfg() {
    return this.#cfg.css;
  }

  constructor(cfg: PluginConfig) {
    this.#cfg = resolveConfig(cfg);
  }

  apply(compiler: Compiler) {
    console.log(compiler);
    // await mergeStyleSheets(compiler.context, this.cssCfg.paths);
    const normalModule = compiler.webpack.NormalModule;
    // const adoptedClasses = new Set<string>();

    // compiler.hooks.compilation.tap(ID, compilation => {
    //   const normalModuleLoader = normalModule.getCompilationHooks(compilation).loader;
    //   console.log(normalModuleLoader);
    //   // normalModuleLoader.tap(ID, async loaderContext => {
    //     // console.log("qweqeqweqweqwe")
    //     // loaderContext[NS] = true;
    //   // });
    // });
    compiler.hooks.
  }
}

export = Plugin;
