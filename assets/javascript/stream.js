function connectStream () {
  document.getElementById ('peers').style.display = 'block';
  document.getElementById ('chat').style.display = 'flex';
  let pc = new RTCPeerConnection ({
    iceServers: [
      {
        urls: 'stun:198.187.28.93:3478',
      },
      {
        urls: 'turn:198.187.28.93:3478',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
      {
        urls: 'turn:198.187.28.93:3478?transport=tcp',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
    ],
  });
  console.log("Hello Azerbaijania Streameerrr")
  console.log(pc)
  pc.ontrack = function (event) {
    if (event.track.kind === 'audio') {
      return;
    }

    console.log ('-------ontrack------');
    console.log (event);

    col = document.createElement ('div');
    col.className = 'column is-6 peer';
    let el = document.createElement (event.track.kind);
    el.srcObject = event.streams[0];
    el.setAttribute ('controls', 'true');
    el.setAttribute ('autoplay', 'true');
    el.setAttribute ('playsinline', 'true');
    let playAttempt = setInterval (() => {
      el
        .play ()
        .then (() => {
          clearInterval (playAttempt);
        })
        .catch (error => {
          console.log ('unable to play the video, user has not interacted yet');
        });
    }, 3000);

    col.appendChild (el);
    document.getElementById ('noonestream').style.display = 'none';
    document.getElementById ('nocon').style.display = 'none';
    document.getElementById ('videos').appendChild (col);

    event.track.onmute = function (event) {
      el.play ();
    };

    event.streams[0].onremovetrack = ({track}) => {
      console.log ('-------onremovetrack------');
      console.log (track);
      if (el.parentNode) {
        el.parentNode.remove ();
      }
      if (document.getElementById ('videos').childElementCount <= 2) {
        document.getElementById ('noonestream').style.display = 'flex';
      }
    };
  };

  console.log("[WebSocket] Connecting to Stream:", StreamWebsocketAddr);
  let ws = new WebSocket (StreamWebsocketAddr);
  pc.onicecandidate = e => {
    if (!e.candidate) {
      return;
    }

    ws.send (
      JSON.stringify ({
        event: 'candidate',
        data: JSON.stringify (e.candidate),
      })
    );
  };

  ws.addEventListener ('error', function (event) {
    console.log ('-------error------');
    console.log (event);
    console.log ('error: ', event);
  });

  ws.onclose = function (evt) {
    console.error("[Stream] WebSocket Error:", evt); // Hata logu
    console.log ('websocket has closed');
    console.log (evt);
    pc.close ();
    pc = null;
    pr = document.getElementById ('videos');
    while (pr.childElementCount > 2) {
      pr.lastChild.remove ();
    }
    document.getElementById ('noonestream').style.display = 'none';
    document.getElementById ('nocon').style.display = 'flex';
    setTimeout (function () {
      connectStream ();
    }, 1000);
  };

  ws.onmessage = function (evt) {
    console.log("[Stream] Received:", evt.data);
    let msg = JSON.parse (evt.data);
    if (!msg) {
      return console.log ('failed to parse msg');
    }

    console.log ('-------onmessage------');
    console.log (evt);
    console.log (msg);

    switch (msg.event) {
      case 'offer':
        let offer = JSON.parse (msg.data);
        if (!offer) {
          return console.log ('failed to parse answer');
        }
        pc.setRemoteDescription (offer);
        pc.createAnswer ().then (answer => {
          pc.setLocalDescription (answer);
          ws.send (
            JSON.stringify ({
              event: 'answer',
              data: JSON.stringify (answer),
            })
          );
        });
        return;

      case 'candidate':
        let candidate = JSON.parse (msg.data);
        if (!candidate) {
          return console.log ('failed to parse candidate');
        }

        pc.addIceCandidate (candidate);
    }
  };

  ws.onerror = function (evt) {
    console.log ('error: ' + evt.data);
  };
}

connectStream ();
