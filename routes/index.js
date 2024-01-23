var express = require('express');
var router = express.Router();
var pug = require('pug');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/clicked', function(req, res, next) {
  let template = pug.compileFile('views/simsalabim.pug');
  let markup = template({ info: "sim sala bim" });
  res.send(markup);
});


module.exports = router;
