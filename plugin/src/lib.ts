import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { PluginConfig } from './config';
import type { PartialOrRequired, RL } from './utility-types';

import { parse } from 'postcss';
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
    const normalModule = compiler.webpack.NormalModule;
    const adoptedClasses = new Set<string>();

    compiler.hooks.compilation.tap(ID, compilation => {
      const normalModuleLoader = normalModule.getCompilationHooks(compilation).loader;
      normalModuleLoader.tap(ID, async loaderContext => {
        loaderContext[NS] = { adoptedClasses };
      });
    });

    compiler.hooks.emit.tap(ID, async compilation => {
      const source = await mergeStyleSheets(compiler.context, this.cssCfg.paths);
      const ast = parse(source);

      ast.walkRules(rule => {
        if (rule.selector[0] === '.' && !adoptedClasses.has(rule.selector.slice(1))) {
          rule.remove();
        }
      });

      const html = compilation.getAsset('index.html');
      html.source._value = `<head>
      <style>
${ast.toString()}
      </style>
      
      <script defer src=\"main.js\"></script></head><body>\n  <div id=\"app\"></div>\n</body>`
    });
  }
}

export = Plugin;
