define(['dist/index', './module/log.service', './module/queryInfo.service'], function(inject, log, queryInfo) {
    const di = new inject.Container();
    di.addService(log.LogService);
    di.addService(queryInfo.QueryInfo);
    console.log(log);
    di.create(log.LogService);
    return '1';
});