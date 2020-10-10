define([
    'require',
    'exports',
    'tslib',
    'dist/amd/index'
], function (require, exports, tslib_1, index_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.QueryInfo = void 0;
    var QueryInfo = function () {
        function QueryInfo() {
            console.log('queryInfo init');
        }
        QueryInfo = tslib_1.__decorate([
            index_1.injectable,
            tslib_1.__metadata('design:paramtypes', [])
        ], QueryInfo);
        return QueryInfo;
    }();
    exports.QueryInfo = QueryInfo;
});