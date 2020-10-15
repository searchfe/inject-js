define([
    'require',
    'exports',
    'tslib',
    'dist/amd/index',
    './queryInfo.service'
], function (require, exports, tslib_1, index_1, queryInfo_service_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var LogService = function () {
        function LogService(queryInfo) {
            console.log('depends:', queryInfo);
            console.log('log init');
        }
        LogService.prototype.destroy = function () {
            console.log('log destroy');
        }
        LogService = tslib_1.__decorate([
            index_1.injectable,
            tslib_1.__metadata('design:paramtypes', [queryInfo_service_1.QueryInfo])
        ], LogService);
        return LogService;
    }();
        exports.LogService = LogService;
});