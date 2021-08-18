import type { PartialOrRequired, RL } from './utility-types';
export declare function resolve(cfg: PluginConfig): Required<PartialOrRequired<PluginConfig, RL>>;
export interface PluginConfig {
    css?: PluginCSSConfig;
}
export interface PluginCSSConfig {
    /**
     * Atomic Class root style sheet paths.
     * Both local paths and remote URL are allowed.
     *
     * ex: ['./global.css', '/path/to/global.css', 'https:\/\/global.css']
     *
     * @default []
     */
    paths?: string[];
    /**
     * @default true
     */
    treeShaking?: boolean;
}
