app.factory('eventing', [function () {
    var socket;
    return {
        connect: function(){
            socket = io.connect(((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.host));
            var onevent = socket.onevent;
            socket.onevent = function (packet) {
                var args = packet.data || [];
                onevent.call (this, packet);    // original call
                packet.data = ["*"].concat(args);
                onevent.call(this, packet);      // additional call to catch-all
            };
        },
        emit: function(){
            if(socket) socket.emit.apply(socket, arguments);
        },
        on:function(){
            if(socket) socket.on.apply(socket, arguments);
        },
        off:function(){
            if(socket) socket.off.apply(socket, arguments);
        }
    }
}]);