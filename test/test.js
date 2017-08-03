var spritus = require('../index');

var S = spritus.findInPath('assets/css/app.css');
S.saveTo('public/css/app.css');