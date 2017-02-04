const request = require('request');
const specHelper = require('./spec-helper.js');

function postFakeTodo(body, cb) {
    if (typeof(body) === 'function') {
        cb = body;
        body = { title: 'foo', checked: true };
    }

    const options = {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }

    return request.post('http://localhost:3000/todos', options, cb);
};

function putFakeTodo(id, body, cb) {
    if (typeof(body) === 'function') {
        cb = body;
        body = { title: 'bar-updated', checked: false };
    }

    const options = {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }

    return request.put(`http://localhost:3000/todos/${id}`, options, cb);
};

beforeAll(done => {
    request.delete('http://localhost:3000/todos', (err, response) => {
        done();
    });
});

afterEach(done => {
    request.delete('http://localhost:3000/todos', (err, response) => {
        done();
    });
});

describe('Todo resource:', () => {

    describe('POST /todos', () => {

        it('returns correct status and headers', done => {
            postFakeTodo((err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                done();
            });
        });

        it('returns 400 in case of broken body', done => {
            postFakeTodo({}, (err, response) => {
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        it('returns the new todo resource', done => {
            postFakeTodo((err, response) => {
                const todoRes = JSON.parse(response.body);

                expect(todoRes.title).toBe('foo'),
                expect(todoRes.checked).toBe(true);
                expect(todoRes.id).toBeUndefined('id should not be shipped to consumer.');
                done();
            });
        });

        it('returns also the _links for the todo resource', done => {
            postFakeTodo((err, response) => {
                const todoRes = JSON.parse(response.body);

                expect(todoRes._links).toBeDefined();
                expect(Object.keys(todoRes._links).length).toBe(3);
                expect(todoRes._links.self.href).toBe('http://localhost:3000/todos/0');
                expect(todoRes._links['todo:update']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Updates a todo item.',
                    method: 'PUT'
                });
                expect(todoRes._links['todo:delete']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Deletes a todo item!',
                    method: 'DELETE'
                });

                done();
            });
        });

        it('returns the new todo resource inside the list', done => {
            postFakeTodo((err, response) => {
                const todoRes = JSON.parse(response.body);

                // follow-up GET
                request.get('http://localhost:3000/todos', (err, response) => {
                    const todoListRes = JSON.parse(response.body);
                    const todos = todoListRes._embedded['todo:list'];

                    expect(todos.length).toBe(1);
                    expect(todos[0]._links.self).toEqual(todoRes._links.self);
                    expect(todos[0].title).toBe('foo'),
                    expect(todos[0].checked).toBe(true);
                    expect(todos[0].id).toBeUndefined('id should not be shipped to consumer.');
                    done();
                });
            });
        });
    });

    describe('GET /todo/:id', () => {
        beforeEach(done => {
            postFakeTodo((err, response) => {
                done();
            });
        });

        it('returns correct status and headers', done => {
            request.get('http://localhost:3000/todos/0', (err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                done();
            });
        });

        it('returns 404 in case of wrong id', done => {
            request.get('http://localhost:3000/todos/42', (err, response) => {
                expect(response.statusCode).toBe(404);
                done();
            });
        });

        it('returns correct _links', done => {
            request.get('http://localhost:3000/todos/0', (err, response) => {
                const todoRes = JSON.parse(response.body);

                expect(Object.keys(todoRes._links).length).toBe(3);
                expect(todoRes._links.self.href).toBe('http://localhost:3000/todos/0');
                expect(todoRes._links['todo:update']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Updates a todo item.',
                    method: 'PUT'
                });
                expect(todoRes._links['todo:delete']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Deletes a todo item!',
                    method: 'DELETE'
                });

                done();
            });
        });

        it('returns the new todo resource inside the list', done => {
            request.get('http://localhost:3000/todos/0', (err, response) => {
                const todoRes = JSON.parse(response.body);
                expect(todoRes.title).toBe('foo'),
                expect(todoRes.checked).toBe(true);
                expect(todoRes.id).toBeUndefined('id should not be shipped to consumer.');
                done();
            });
        });
    });

    describe('DELETE /todo/:id', () => {
        beforeEach(done => {
            postFakeTodo((err, response) => {
                done();
            });
        });

        it('returns 204 - No Content', done => {
            request.delete('http://localhost:3000/todos/0', (err, response) => {
                expect(response.statusCode).toBe(204);
                done();
            });
        });

        it('returns 404 in case of wrong id', done => {
            request.delete('http://localhost:3000/todos/42', (err, response) => {
                expect(response.statusCode).toBe(404);
                done();
            });
        });

        it('returns empty list of todo resources', done => {
            request.delete('http://localhost:3000/todos/0', (err, response) => {
                request.get('http://localhost:3000/todos', (err, response) => {
                    const todoListRes = JSON.parse(response.body);

                    expect(todoListRes._embedded['todo:list'].length).toBe(0);
                    done();
                });
            });
        });
    });

    describe('PUT /todo/:id', () => {
        beforeEach(done => {
            postFakeTodo((err, response) => {
                done();
            });
        });

        it('returns correct status and headers', done => {
            putFakeTodo(0, (err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                done();
            });
        });

        it('returns 404 in case of wrong id', done => {
            putFakeTodo(42, (err, response) => {
                expect(response.statusCode).toBe(404);
                done();
            });
        });

        it('returns the new todo resource', done => {
            putFakeTodo(0, (err, response) => {
                const todoRes = JSON.parse(response.body);

                expect(todoRes.title).toBe('bar-updated'),
                expect(todoRes.checked).toBe(false);
                expect(todoRes.id).toBeUndefined('id should not be shipped to consumer.');
                done();
            });
        });

        it('returns also the _links for the todo resource', done => {
            putFakeTodo(0, (err, response) => {
                const todoRes = JSON.parse(response.body);

                expect(todoRes._links).toBeDefined();
                expect(Object.keys(todoRes._links).length).toBe(3);
                expect(todoRes._links.self.href).toMatch(/^http\:\/\/localhost:3000\/todos\/\d+/);
                expect(todoRes._links['todo:update']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Updates a todo item.',
                    method: 'PUT'
                });
                expect(todoRes._links['todo:delete']).toEqual({
                    href: 'http://localhost:3000/todos/0',
                    title: 'Deletes a todo item!',
                    method: 'DELETE'
                });

                done();
            });
        });

        it('returns the new todo resource inside the list', done => {
            putFakeTodo(0, (err, response) => {
                const todoRes = JSON.parse(response.body);

                // follow-up GET
                request.get('http://localhost:3000/todos', (err, response) => {
                    const todoListRes = JSON.parse(response.body);
                    const todos = todoListRes._embedded['todo:list'];

                    expect(todos.length).toBe(1);
                    expect(todos[0]._links.self).toEqual(todoRes._links.self);
                    expect(todos[0].title).toBe('bar-updated'),
                    expect(todos[0].checked).toBe(false);
                    expect(todos[0].id).toBeUndefined('id should not be shipped to consumer.');
                    done();
                });
            });
        });
    });
});

describe('TodoList resource:', () => {
    describe('GET /todos', () => {
        it('returns correct status and headers', done => {
            request.get('http://localhost:3000/todos', (err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                done();
            });
        });

        it('returns correct _links', done => {
            request.get('http://localhost:3000/todos', (err, response) => {
                const todoListRes = JSON.parse(response.body);

                expect(Object.keys(todoListRes._links).length).toBe(4);
                expect(todoListRes._links['todo:create']).toEqual({
                    href: 'http://localhost:3000/todos',
                    title: 'Creates a new todo.',
                    method: 'POST'
                });
                expect(todoListRes._links['todo:clear']).toEqual({
                    href: 'http://localhost:3000/todos',
                    title: 'Deletes ALL todo items!',
                    method: 'DELETE'
                });
                done();
            });
        });

        it('returns empty list of todo resources', done => {
            request.get('http://localhost:3000/todos', (err, response) => {
                const todoListRes = JSON.parse(response.body);

                expect(todoListRes._embedded['todo:list']).toBeDefined();
                expect(todoListRes._embedded['todo:list'].length).toBe(0);
                done();
            });
        });
    });

    describe('GET /todos?search=', () => {
        it('returns list of matching todo resources', done => {
            postFakeTodo(() => {
                postFakeTodo({ title: 'I\'m sorry Dave, I\'m afraid I can\'t do that' }, () => {
                    request.get('http://localhost:3000/todos?search=Dave', (err, response) => {
                        const todoListRes = JSON.parse(response.body);
                        const todos = todoListRes._embedded['todo:list'];

                        expect(todos).toBeDefined();
                        expect(todos.length).toBe(1);
                        expect(todos[0]._links.self.href).toEqual('http://localhost:3000/todos/1');
                        expect(todos[0].title).toBe('I\'m sorry Dave, I\'m afraid I can\'t do that'),
                        expect(todos[0].checked).toBe(false);
                        done();
                    });
                })
            })
        });

        it('returns list of checked todo resources', done => {
            postFakeTodo(() => {
                postFakeTodo({ title: 'I\'m sorry Dave, I\'m afraid I can\'t do that' }, () => {
                    request.get('http://localhost:3000/todos?checked=true', (err, response) => {
                        const todoListRes = JSON.parse(response.body);
                        const todos = todoListRes._embedded['todo:list'];

                        expect(todos).toBeDefined();
                        expect(todos.length).toBe(1);
                        expect(todos[0]._links.self.href).toEqual('http://localhost:3000/todos/0');
                        expect(todos[0].title).toBe('foo'),
                        expect(todos[0].checked).toBe(true);
                        done();
                    });
                })
            })
        });

        it('returns list of unchecked todo resources', done => {
            postFakeTodo(() => {
                postFakeTodo({ title: 'I\'m sorry Dave, I\'m afraid I can\'t do that' }, () => {
                    request.get('http://localhost:3000/todos?checked=false', (err, response) => {
                        const todoListRes = JSON.parse(response.body);
                        const todos = todoListRes._embedded['todo:list'];

                        expect(todos).toBeDefined();
                        expect(todos.length).toBe(1);
                        expect(todos[0]._links.self.href).toEqual('http://localhost:3000/todos/1');
                        expect(todos[0].title).toBe('I\'m sorry Dave, I\'m afraid I can\'t do that'),
                        expect(todos[0].checked).toBe(false);
                        done();
                    });
                })
            })
        });
    });

    describe('DELETE /todos', () => {
        it('returns 204 - No Content', done => {
            request.delete('http://localhost:3000/todos', (err, response) => {
                expect(response.statusCode).toBe(204);
                done();
            });
        });
    });
});

