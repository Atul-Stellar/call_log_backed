const Queue = require('bee-queue');
const { syncJobssLog } = require('./log.config');
var options;
if(process.env.env == 'dev'){
     options = {
        getEvents: true,
        removeOnSuccess: true,
        stallInterval: 5000,
        redis: {
            host: '127.0.0.1',
            port: 6379,
            
        },
    }
}else{
     options = {
        getEvents: true,
        removeOnSuccess: true,
        stallInterval: 5000,
        redis: {
            host: process.env.REDIS_HOST1,
            port: process.env.REDIS_PORT,
            password : process.env.REDIS_PASS
        },
    }

}
const syncQueues = new Queue('sync', options);
const orderSync = new Queue('order',options);


syncQueues.process(1,(job,done)=>{
    syncJobssLog.error({status:'orderSync',jobId:job.id});
})
// orderSync.on('job succeeded', (jobId, result) => {
//     syncJobssLog.error({status:'orderSync',jobId:JSON.stringify(jobId),message:JSON.stringify(result)});

//   });

module.exports = {syncQueues,orderSync}; 