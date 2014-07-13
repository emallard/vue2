module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        ts: {
            // use to override the default options, See: http://gruntjs.com/configuring-tasks#options
            // these are the default options to the typescript compiler for grunt-ts:
            // see `tsc --help` for a list of supported options.
            options: {
                compile: true, // perform compilation. [true (default) | false]
                comments: false, // same as !removeComments. [true | false (default)]
                target: 'es5', // target javascript language. [es3 (default) | es5]
                module: 'amd', // target javascript module style. [amd (default) | commonjs]
                sourceMap: true, // generate a source map for every output js file. [true (default) | false]
                sourceRoot: '', // where to locate TypeScript files. [(default) '' == source ts location]
                mapRoot: '', // where to locate .map.js files. [(default) '' == generated js location.]
                declaration: true // generate a declaration .d.ts file for every output js file. [true | false (default)]
            },
            // a particular target
            dev: {
                src: ["src/**/*.ts", "libs/**/*.ts"],
                //reference: 'src/reference.ts',
                out: 'out/vue2.js'
                //outDir: 'out'
            },

            example: {
                src: ["example/**/*.ts"],
                out: 'example/out/example.js'
            }
        },
    });
    
    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts:dev"]);
};
