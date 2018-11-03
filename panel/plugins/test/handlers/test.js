"use strict";
//This is a server side websocket handler. This function is called on every new connection. 
//You can listen to events of a client with socket.on and send using socket.emit
module.exports = function(socket    ){
    socket.on("pingsocket",function(){
        socket.emit("pongsocket","from my handler");
        socket.broadcast.emit("pongsocket","from my handler");
    });
};