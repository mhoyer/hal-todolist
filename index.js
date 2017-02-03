const koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const parse = require('co-body');
const bodyParser = require('koa-bodyparser');

const app = koa();

app.use(logger());
app.use(bodyParser({enableTypes: ['json']}));
app.use(function* (next) {
  yield next;
  this.type = 'application/hal+json; charset=utf-8';
});
app.use(require('./index.middleware'));
app.use(require('./todos.middleware'));

app.listen(3000);
