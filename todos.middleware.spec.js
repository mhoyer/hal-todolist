const request = require('request');
const specHelper = require('./spec-helper.js');

beforeAll(done => {
    request.delete('http://localhost:3000/todos', (err, response) => {
        done();
    });
});

describe('Todo resource:', () => {

    function postFakeTodo(cb, body) {
        if (body === undefined) body = { title: 'foo', checked: true };

        const options = {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }

        return request.post('http://localhost:3000/todos', options, cb);
    };

    function putFakeTodo(cb, body) {
        if (body === undefined) body = { title: 'bar-updated', checked: false };

        const options = {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }

        return request.post('http://localhost:3000/todos', options, cb);
    };

    afterEach(done => {
        request.delete('http://localhost:3000/todos', (err, response) => {
            done();
        });
    });

    describe('POST /todos', () => {

        it('returns correct status and headers', done => {
            postFakeTodo((err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
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
                expect(Object.keys(todoRes._links).length).toBe(1);
                expect(todoRes._links.self.href).toMatch(/^http\:\/\/localhost:3000\/todos\/\d+/);

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

                expect(Object.keys(todoRes._links).length).toBe(1);
                expect(todoRes._links.self.href).toBe('http://localhost:3000/todos/0');

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

    describe('DELETE /todos', () => {
        it('returns 204 - No Content', done => {
            request.delete('http://localhost:3000/todos', (err, response) => {
                expect(response.statusCode).toBe(204);
                done();
            });
        });
    });
});

