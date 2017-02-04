const route = require('koa-route');
const compose = require('koa-compose');
const {createLinks} = require('./utils');

let todoIdCounter = 0;
let todos = [];

function halConverter(origin) {
    return todo => {
        const {id,title,checked} = todo;
        const _links = { self: { href: `${origin}/todos/${id}` } };

        return {
            _links,
            title,
            checked
        };
    }
}

function *getTodoList() {
    const origin = this.request.origin;
    const halify = halConverter(origin);
    const _links = createLinks(this.request, {
        'todo:create': { href: `${origin}/todos`, title: 'Creates a new todo.', method: 'POST' },
        'todo:clear': { href: `${origin}/todos`, title: 'Deletes ALL todo items!', method: 'DELETE' },
    });
    const _embedded = {
        'todo:list': todos.map(halify)
    }

    this.body = yield { _links, _embedded };
};

function *createTodo() {
    const origin = this.request.origin;
    const halify = halConverter(origin);
    const {title, checked} = this.request.body;
    const id = todoIdCounter; todoIdCounter++;
    const todo = {title,checked,id};

    todos.push(todo);

    this.body = yield halify(todo);
}

function *findTodo(id) {
    id = parseInt(id);
    const origin = this.request.origin;
    const halify = halConverter(origin);
    const todo = todos.find(t => t.id === id);
    if (!todo) return this.status = 404;

    this.body = yield halify(todo);
};

function *updateTodo(id) {
    id = parseInt(id);
    const origin = this.request.origin;
    const halify = halConverter(origin);
    const todo = todos.find(t => t.id === id);
    if (!todo) return this.status = 404;

    const {title, checked} = this.request.body;
    todo.title = title;
    todo.checked = checked;

    this.body = yield halify(todo);
};

function *deleteTodo(id) {
    id = parseInt(id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return this.status = 404;

    todos = todos.filter(t => t !== todo);

    this.status = 204;
};

function *clearTodoList() {
    todos = [];
    todoIdCounter = 0;

    this.status = 204;
};

const middleware = compose([
    route.get('/todos', getTodoList),
    route.post('/todos', createTodo),
    route.delete('/todos', clearTodoList),

    route.get('/todos/:id', findTodo),
    route.delete('/todos/:id', deleteTodo),
    route.put('/todos/:id', updateTodo),
]);

module.exports = middleware;