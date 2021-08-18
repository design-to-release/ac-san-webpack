import type { TreeConstructor } from 'hyntax';
import type { LoaderContext } from 'webpack';

import { constructTree, tokenize } from 'hyntax';
import MagicString from 'magic-string';
import { Project, SyntaxKind } from 'ts-morph';
import { PluginSymbol } from './plugin';

export default async function(this: LoaderContext<{ dbg: boolean }>, contents: string) {
  const loaderContext = this;
  const options = loaderContext.getOptions();

  const magicContent = new MagicString(contents);
  const { tokens } = tokenize(contents);
  const { ast } = constructTree(tokens);

  const tpl = ast.content.children.find(
    ({ nodeType, content }) => nodeType === 'tag' && (content as TreeConstructor.NodeContents.Tag).name === 'template',
  ) as TreeConstructor.TagNode | undefined;
  const script = ast.content.children.find(({ nodeType }) => nodeType === 'script') as
    | TreeConstructor.ScriptNode
    | undefined;

  if (!tpl) {
    return contents;
  }

  let stack = [tpl];
  let usedIndex = 0;
  const sheetRegistries: Array<Record<string, string[] | undefined>> = [];
  for (let curr = tpl.content, i = 0; i < stack.length; ++i) {
    curr = stack[i].content;
    if (curr.children) {
      stack.push(...curr.children.filter((i) => i.nodeType === 'tag') as TreeConstructor.TagNode[]);
    }

    if (curr.attributes) {
      let needInject = false;
      let classAttrNode = undefined;
      for (const attr of curr.attributes) {
        if (attr.key?.content.startsWith('ac-')) {
          const usedClasses = attr.value?.content.split(' ').filter(i => {
            if (i) {
              loaderContext[PluginSymbol].adoptedClasses.add(i);
              return true;
            }

            return false;
          });
          needInject = true;
          magicContent.overwrite(
            attr.key.startPosition,
            (attr.endWrapper?.endPosition ?? attr.key.startPosition) + 1,
            '',
          );

          if (!sheetRegistries[usedIndex]) {
            sheetRegistries[usedIndex] = {};
          }
          sheetRegistries[usedIndex][attr.key.content.slice(3)] = usedClasses;
        } else if (attr.key?.content === 'class') {
          classAttrNode = attr;
        }
      }
      if (needInject) {
        let startPos = curr.openStart.endPosition;
        let endPos = -1;
        const cls = `class="${classAttrNode?.value?.content
          ?? ''} {{ __θac${usedIndex} }}"`;
        if (classAttrNode) {
          startPos = classAttrNode.key?.startPosition ?? 0;
          endPos = classAttrNode.endWrapper?.endPosition ?? 0;
        }
        const event = `on-actrigger="__ac${usedIndex}Trigger"`;

        if (endPos === -1) {
          magicContent.appendRight(startPos + 1, ` ${event} ${cls} `);
        } else {
          magicContent.overwrite(startPos, endPos + 1, `${event} ${cls}`);
        }

        usedIndex++;
      }
    }
  }

  if (script) {
    const basePos = script.content.openEnd.endPosition;

    magicContent.appendRight(
      basePos + 1,
      `\r\nimport { ac as __θac } from './atomic-class.js';
      ${
        Array(usedIndex).fill(0).map((_, i) => `
        const __ac${i}Trigger = function (ev) {
          __θac(${JSON.stringify(sheetRegistries[i])}, function (vm, s) {
            vm.data.set('__θac0', s);
          })(this, ev);
        };
      `).join('\r\n')
      }`,
    );

    const proj = new Project();
    const sourceFile = proj.createSourceFile(
      'temp.ts',
      script.content.value.content,
    );
    const exportAssignment = sourceFile.getExportAssignment((i) => !i.isExportEquals());
    const returnStmt = exportAssignment?.getDescendantStatements().find((i) => i.asKind(SyntaxKind.ReturnStatement));

    let startPos = basePos + (returnStmt?.getStart() ?? 0) + 8;
    let endPos = basePos + (returnStmt?.getEnd() ?? startPos) + 1;
    magicContent.appendRight(startPos, 'Object.assign(');
    magicContent.appendRight(
      endPos,
      `, { ${Array(usedIndex).fill(0).map((_, i) => `__θac${i}: ''`).join(',')} });`,
    );

    // Inject event handlers
    magicContent.appendRight(
      basePos + (exportAssignment?.getStart() ?? 0) + 18,
      `${
        Array(usedIndex).fill(0).map((_, i) => `
        __ac${i}Trigger,
      `).join('')
      }`,
    );
  }

  contents = magicContent.toString();

  if (options.dbg) {
    console.log(contents);
  }

  return contents;
}
