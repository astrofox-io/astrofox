const through = require('through2');
const glslman = require('glsl-man');

function compile(code) {
    return glslman.string(
        glslman.parse(code),
        {tab: '', space: '', newline: ''}
    );
}

module.exports = () => {
    let shaders = {};
    let lastFile = null;
    
    return through.obj(
        function(file, enc, callback) {
            let info = /(\w+)[\/\\]{1}(\w+)\.glsl$/.exec(file.relative);

            if (info) {
                let path = info[1],
                    name = info[2],
                    code = file.contents.toString('ascii');

                if (!shaders[path]) shaders[path] = {};

                try {
                    shaders[path][name] = compile(code);
                }
                catch (err) {
                    return callback(new Error(file.relative + ': ' + err), file);
                }

                lastFile = file;
            }

            callback();
        },
        function(callback) {
            if (!lastFile) {
                return callback();
            }

            let file = lastFile.clone({ contents: false });

            file.contents = new Buffer('module.exports='+JSON.stringify(shaders), 'ascii');

            this.push(file);

            callback();
        }
    );
};
