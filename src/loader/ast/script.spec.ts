import { readFileSync } from 'fs';
import { join } from 'path';

import MagicString from 'magic-string';
import { Project } from 'ts-morph';
import { expandsReturnStmt, getIninDataReturnStmt } from './script';

const testdataDir = join(__dirname, './testdata');

test('Basic', async () => {
  const content = readFileSync(join(testdataDir, './simple-module.ts')).toString();

  const proj = new Project();
  const sourceFile = proj.createSourceFile('temp.ts', content);

  const exportAssignment = sourceFile.getExportAssignment((i) => !i.isExportEquals())!;
  const returnStmt = getIninDataReturnStmt(exportAssignment);
  expect(returnStmt.getFullText()).toEqual(`
    return {
      hello: "world",
    };`);

  const magicContent = new MagicString(content);
  expandsReturnStmt(magicContent, returnStmt, `{ foo: "bar" }`);
  expect(magicContent.toString()).toEqual(
    `export default {
  initData() {
    return Object.assign( {
      hello: "world",
    }, { foo: "bar" });
  },
};
`,
  );
});
