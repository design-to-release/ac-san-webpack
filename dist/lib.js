"use strict";
var _plugin = _interopRequireDefault(require("./plugin"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
module.exports = {
    Plugin: _plugin.default,
    loader: require.resolve('./loader')
};
