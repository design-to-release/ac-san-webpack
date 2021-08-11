import type { Compiler, WebpackPluginInstance } from 'webpack';

class ACSanPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
  }
}

export = ACSanPlugin;
