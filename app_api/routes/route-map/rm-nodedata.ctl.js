const controller = require('../../controllers/nodedata');
module.exports.routeConfig = {
  '/nd/':[
    {'getnd/:lid/:nid':{get: controller.getNodeData}},
    {'getavgnd/:lid/:nid':{get: controller.getNodeAvgData}},
    {'getnsd/:lid':{get: controller.getNodesData}},
    {'getnsdavg/:lid':{get: controller.getNodesDataAvg}},
    {'getsdl/:lid/:lc':{get: controller.getSynDataLog}},
    {':lid/sdtc/:sts':{post: controller.synDataTaskCtrl}},
    {':lid/eint':{post: controller.executeInspectNodeTask}},
    {':lid/save':{post: controller.savePastNodeData}},
  ]
};

//router.get('/nd/getnd/:lid/:nid',ctrlNodeData.getNodeData);
//router.get('/nd/getavgnd/:lid/:nid',ctrlNodeData.getNodeAvgData);
//router.get('/nd/getnsd/:lid',ctrlNodeData.getNodesData);
//router.get('/nd/getnsdavg/:lid',ctrlNodeData.getNodesDataAvg);
//router.get('/nd/getsdl/:lid/:lc',ctrlNodeData.getSynDataLog);//add @2017-08-09

//router.post('/nd/:lid/sdtc/:sts', ctrlNodeData.synDataTaskCtrl);//ok
//router.post('/nd/:lid/eint', ctrlNodeData.executeInspectNodeTask);//ok
//router.post('/nd/:lid/save', ctrlNodeData.savePastNodeData);//ok
