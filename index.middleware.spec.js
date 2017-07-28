const request = require('request');
const specHelper = require('./spec-helper.js');

describe('Index resource:', () => {
    const options = {
        headers: { 'Content-Type': 'application/hal+json' }
    };

    function getIndex(cb) {
        return request.get('http://localhost:3000', options, cb);
    }

    describe('HEAD /', () => {
        it('returns correct status and headers', done => {
            request.head('http://localhost:3000', options, (err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                expect(response.body).toBe('');
                done();
            });
        });
    });

    describe('GET /', () => {
        it('returns correct status and headers', done => {
            getIndex((err, response) => {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/hal+json; charset=utf-8');
                done();
            });
        });

        it('returns only _links and version', done => {
            getIndex((err, response) => {
                const indexRes = JSON.parse(response.body);

                expect(Object.keys(indexRes).length).toBe(2);
                expect(indexRes._links).toBeDefined();
                expect(indexRes.version).toBe('0.1.0');
                done();
            });
        });

        it('returns correct _links', done => {
            getIndex((err, response) => {
                const indexRes = JSON.parse(response.body);

                expect(Object.keys(indexRes._links).length).toBe(4);
                expect(indexRes._links.curies).toEqual(specHelper.constants._links.curies);
                expect(indexRes._links.self).toEqual({ href: 'http://localhost:3000/' });
                expect(indexRes._links['todo:create']).toEqual({
                    href: 'http://localhost:3000/todos',
                    title: 'Creates a new todo.',
                    method: 'POST'
                });
                expect(indexRes._links['todo:list']).toEqual({
                    href: 'http://localhost:3000/todos',
                    title: 'Lists all todos.'
                });
                done();
            });
        });
    });
});