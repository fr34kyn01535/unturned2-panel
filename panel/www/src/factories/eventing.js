app.factory('eventing', [function () {
    var socket;
    return {
        connect: function(){
            socket = io.connect(((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.host));
        },
        emit: function(){
            if(socket) socket.emit.bind(this);
        },
        on:function(){
            if(socket) socket.on.bind(this);
        }
    }
}]);