//const controller = require('../controllers/serverinfo');
const controller = require('../../controllers/authentication');
module.exports.routeConfig = {
  '/users/':[
    {'register':{post: controller.register}},
    {'update/:uid':{put: controller.updateUser}},
    {'login':{post: controller.login}},
    {'userlist':{get: controller.userList}},
    {':uid':{delete: controller.deleteUser}},
    {':uid':{post: controller.updateLocList}},
  ]
};

//router.post('/users/register', ctrlAuth.register);
//router.put('/users/update/:uid', ctrlAuth.updateUser);
//router.post('/users/login', ctrlAuth.login);
//router.get('/users/userlist', ctrlAuth.userList);
//router.delete('/users/:uid', ctrlAuth.deleteUser);
//router.post('/users/:uid', ctrlAuth.updateLocList);
