app.factory('eventing', [function () {
    return io.connect(((window.location.protocol == "http:" ? "ws://" : "wss://") + window.location.host));
}]);