import type { LoaderContext } from 'webpack';
export default function (this: LoaderContext<{
    dbg: boolean;
}>, contents: string): Promise<string>;
