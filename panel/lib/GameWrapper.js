module.exports = function(){
    const child = require('child_process').spawn('/bin/bash',['-c','/opt/unturned/U4Server.sh -rconport=3000'],{cwd:"/opt/unturned/"});
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.on('close', function (code) {
        process.exit(code);
    });
    return { stderr: child.stderr, stdout: child.stdout };
} 