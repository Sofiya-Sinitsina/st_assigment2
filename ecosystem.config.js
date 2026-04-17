module.exports = {
    apps: [
        {
            name: "api-3000",
            script: "src/server.js",
            env: {
                PORT: 3000,
            },
        },
        {
            name: "api-4000",
            script: "src/server.js",
            env: {
                PORT: 4000,
            },
        },
    ],
};