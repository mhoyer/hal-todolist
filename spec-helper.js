module.exports.constants = {
    _links: {
        curies: [
            {
                href: "http://localhost:3000/rels/{rel}",
                name: "todo",
                templated: true
            }
        ],
        'todo:todos': {
            href: "http://localhost:3000/",
            title: "Entry point for Todo List REST API."
        },
        'todo:todo:create': { href: "http://localhost:3000/todo" },
    }
};