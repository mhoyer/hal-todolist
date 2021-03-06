const koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const cors = require('koa-cors');
const parse = require('co-body');
const bodyParser = require('koa-bodyparser');

const app = koa();

app.use(logger());
app.use(cors());
app.use(bodyParser({enableTypes: ['json']}));
app.use(function* (next) {
  yield next;
  this.type = 'application/hal+json; charset=utf-8';
});
app.use(require('./index.middleware'));
app.use(require('./todos.middleware'));

app.listen(3000);
console.log('Running todo list service on: http://localhost:3000');