"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _default;
var _magicString = _interopRequireDefault(require("magic-string"));
var _hyntax = require("hyntax");
var _tsMorph = require("ts-morph");
var _plugin = require("./plugin");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function _default(contents) {
    const loaderContext = this;
    const options = loaderContext.getOptions();
    const magicContent = new _magicString.default(contents);
    const { tokens  } = (0, _hyntax).tokenize(contents);
    const { ast  } = (0, _hyntax).constructTree(tokens);
    const tpl = ast.content.children.find(({ nodeType , content  })=>nodeType === 'tag' && content.name === 'template'
    );
    const script = ast.content.children.find(({ nodeType  })=>nodeType === 'script'
    );
    if (!tpl) {
        return contents;
    }
    let stack = [
        tpl
    ];
    let usedIndex = 0;
    const sheetRegistries = [];
    for(let curr = tpl.content, i = 0; i < stack.length; ++i){
        curr = stack[i].content;
        if (curr.children) {
            stack.push(...curr.children.filter((i1)=>i1.nodeType === 'tag'
            ));
        }
        if (curr.attributes) {
            let needInject = false;
            let classAttrNode = undefined;
            for (const attr of curr.attributes){
                var ref, ref1;
                if ((ref = attr.key) === null || ref === void 0 ? void 0 : ref.content.startsWith('ac-')) {
                    var ref5, ref6;
                    const usedClasses = (ref5 = attr.value) === null || ref5 === void 0 ? void 0 : ref5.content.split(' ').filter((i1)=>{
                        if (i1) {
                            loaderContext[_plugin.PluginSymbol].adoptedClasses.add(i1);
                            return true;
                        }
                        return false;
                    });
                    needInject = true;
                    var ref7;
                    magicContent.overwrite(attr.key.startPosition, ((ref7 = (ref6 = attr.endWrapper) === null || ref6 === void 0 ? void 0 : ref6.endPosition) !== null && ref7 !== void 0 ? ref7 : attr.key.startPosition) + 1, '');
                    if (!sheetRegistries[usedIndex]) {
                        sheetRegistries[usedIndex] = {
                        };
                    }
                    sheetRegistries[usedIndex][attr.key.content.slice(3)] = usedClasses;
                } else if (((ref1 = attr.key) === null || ref1 === void 0 ? void 0 : ref1.content) === 'class') {
                    classAttrNode = attr;
                }
            }
            if (needInject) {
                var ref8;
                let startPos = curr.openStart.endPosition;
                let endPos = -1;
                var ref9;
                const cls = `class="${(ref9 = classAttrNode === null || classAttrNode === void 0 ? void 0 : (ref8 = classAttrNode.value) === null || ref8 === void 0 ? void 0 : ref8.content) !== null && ref9 !== void 0 ? ref9 : ''} {{ __θac${usedIndex} }}"`;
                if (classAttrNode) {
                    var ref10, ref11;
                    var ref12;
                    startPos = (ref12 = (ref10 = classAttrNode.key) === null || ref10 === void 0 ? void 0 : ref10.startPosition) !== null && ref12 !== void 0 ? ref12 : 0;
                    var ref13;
                    endPos = (ref13 = (ref11 = classAttrNode.endWrapper) === null || ref11 === void 0 ? void 0 : ref11.endPosition) !== null && ref13 !== void 0 ? ref13 : 0;
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
        magicContent.appendRight(basePos + 1, `\r\nimport { ac as __θac } from './atomic-class.js';
      ${Array(usedIndex).fill(0).map((_, i1)=>`
        const __ac${i1}Trigger = function (ev) {
          __θac(${JSON.stringify(sheetRegistries[i1])}, function (vm, s) {
            vm.data.set('__θac0', s);
          })(this, ev);
        };
      `
        ).join('\r\n')}`);
        const proj = new _tsMorph.Project();
        const sourceFile = proj.createSourceFile('temp.ts', script.content.value.content);
        const exportAssignment = sourceFile.getExportAssignment((i1)=>!i1.isExportEquals()
        );
        const returnStmt = exportAssignment === null || exportAssignment === void 0 ? void 0 : exportAssignment.getDescendantStatements().find((i1)=>i1.asKind(_tsMorph.SyntaxKind.ReturnStatement)
        );
        var ref14;
        let startPos = basePos + ((ref14 = returnStmt === null || returnStmt === void 0 ? void 0 : returnStmt.getStart()) !== null && ref14 !== void 0 ? ref14 : 0) + 8;
        var ref15;
        let endPos = basePos + ((ref15 = returnStmt === null || returnStmt === void 0 ? void 0 : returnStmt.getEnd()) !== null && ref15 !== void 0 ? ref15 : startPos) + 1;
        magicContent.appendRight(startPos, 'Object.assign(');
        magicContent.appendRight(endPos, `, { ${Array(usedIndex).fill(0).map((_, i1)=>`__θac${i1}: ''`
        ).join(',')} });`);
        var ref16;
        // Inject event handlers
        magicContent.appendRight(basePos + ((ref16 = exportAssignment === null || exportAssignment === void 0 ? void 0 : exportAssignment.getStart()) !== null && ref16 !== void 0 ? ref16 : 0) + 18, `${Array(usedIndex).fill(0).map((_, i1)=>`
        __ac${i1}Trigger,
      `
        ).join('')}`);
    }
    contents = magicContent.toString();
    if (options.dbg) {
        console.log(contents);
    }
    return contents;
}
