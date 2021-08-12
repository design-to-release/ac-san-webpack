import { join, isAbsolute } from 'path';
import { URL } from 'url';
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import { parse, walk, generate } from 'css-tree';

const NewLine = '\r\n';

class Path {
  #path: string;
  isRemote: boolean;
  constructor(path: string, isRemote = false) {
    this.#path = path;
    this.isRemote = isRemote;
  }
  toString() {
    return this.#path;
  }
}

export async function merge(parent: string, paths: string[]): Promise<string> {
  const resolvedPaths = resolvePaths(parent, paths);

  const tasks: Array<Promise<string>> = [];
  for (const i of resolvedPaths) {
    tasks.push(loadStyleSheet(i));
  }
  return (await Promise.all(tasks)).join(NewLine);

  // const ast = parse(source);
  // walk(ast, node => {
  //   console.log(node);
  // });

  // const code = generate(ast);
  // console.log(code);
}

async function loadStyleSheet(path: Path): Promise<string> {
  if (path.isRemote) {
    const resp = await fetch(path.toString());
    
    return resp.text();
  }

  return (await readFile(path.toString())).toString();
}

function resolvePaths(parent: string, paths: string[]): Path[] {
  return paths.map(curr => {
    if (isRemote(curr)) {
      return new Path(curr, true);
    } else if (isAbsolute(curr)) {
      return new Path(curr);
    }

    return new Path(join(parent, curr));
  });
}

function isRemote(s: string): boolean {
  let url: URL;

  try {
    url = new URL(s);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}