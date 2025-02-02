function connectViewer () {
    console.log(ViewerWebsocketAddr);
console.log(RoomWebsocketAddr);
console.log(ChatWebsocketAddr);
  viewerCount = document.getElementById ('viewer-count');
  console.log("[WebSocket] Connecting to Viewer:", ViewerWebsocketAddr);
  viewerWs = new WebSocket (ViewerWebsocketAddr);

  viewerWs.onclose = function (evt) {
    console.log ('websocket has closed');
    viewerCount.innerHTML = '0';
    setTimeout (function () {
      connectViewer ();
    }, 1000);
  };

  viewerWs.onmessage = function (evt) {
    console.log("[Viewer] Received:", evt.data);
    d = evt.data;
    if (d === parseInt (d, 10)) {
      return;
    }
    viewerCount.innerHTML = d;
  };

  viewerWs.onerror = function (evt) {
    console.error("[Viewer] WebSocket Error:", evt);
    console.log ('error: ' + evt.data);
  };
}

connectViewer ();
