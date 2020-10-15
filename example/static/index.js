define(['dist/amd/index', './module/log.service', './module/queryInfo.service'], function(inject, log, queryInfo) {
    const di = new inject.Container();
    di.addService(log.LogService);
    di.addService(queryInfo.QueryInfo);
    di.create(log.LogService);
    di.destroy();
    console.log(di);
    return di;
});