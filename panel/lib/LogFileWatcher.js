const Tail = require('tail').Tail;
module.exports = function(){
    return new Tail("/opt/unturned/U4/Saved/Logs/U4.log");
};