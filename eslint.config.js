// eslint.config.js

module.exports = [
    {
        ignores: [
            ".vscode-test/**",
            "node_modules/**"
        ]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: "module",
            globals: {
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",

                suite: "readonly",
                test: "readonly",
                setup: "readonly",
                teardown: "readonly",
                console: "readonly"
            }
        },
        rules: {
            "no-const-assign": "warn",
            "no-this-before-super": "warn",
            "no-undef": "warn",
            "no-unreachable": "warn",
            "no-unused-vars": "warn",
            "constructor-super": "warn",
            "valid-typeof": "warn"
        }
    }
];
