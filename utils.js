
function createLinks(request, rels) {
    const origin = request.origin;
    const self = origin + request.originalUrl;

    return Object.assign({}, {
        curies: [ { name: 'todo', href: `${origin}/rels/{rel}`, templated: true } ],
        self: { href: self }
    }, rels);
}

module.exports = {
    createLinks
}