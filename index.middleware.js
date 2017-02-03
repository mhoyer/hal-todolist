const route = require('koa-route');
const compose = require('koa-compose');
const {createLinks} = require('./utils');

function *head() { return; };
function *options() { this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS"; };
function *trace() { this.body = "Smart! But you can't trace."; }

function *get(next) {
    const origin = this.request.origin;
    const _links = createLinks(this.request, {
        'todo:create': { href: `${origin}/todos`, title: 'Creates a new todo.', method: 'POST' },
        'todo:list': { href: `${origin}/todos`, title: 'Lists all todos.' },
    });

    this.body = yield { _links };
};

const middleware = compose([
    route.get('/', get),
    route.options('/', options),
    route.trace('/', trace),
    route.head('/', head)
]);

module.exports = middleware;