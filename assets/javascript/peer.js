let activePeerConnections = [];
let localStream;
let audioTrack;

navigator.mediaDevices.addEventListener ('devicechange', handleDeviceChange);

async function handleDeviceChange () {
  try {
    const newStream = await navigator.mediaDevices.getUserMedia ({
      video: false,
      audio: {
        sampleSize: 16,
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const newAudioTrack = newStream.getAudioTracks ()[0];

    if (audioTrack) {
      audioTrack.stop ();
      localStream.removeTrack (audioTrack);
    }
    localStream.addTrack (newAudioTrack);
    audioTrack = newAudioTrack;

    activePeerConnections.forEach (pc => {
      if (s.track) {
        const sender = pc.getSenders ().find (s => s.track.kind === 'audio');
        if (sender) sender.replaceTrack (newAudioTrack);
      }
    });

    newStream.getVideoTracks ().forEach (track => track.stop ());
  } catch (error) {
    console.error ('Error updating audio device:', error);
  }
}

function copyToClipboard (text) {
  if (window.clipboardData && window.clipboardData.setData) {
    clipboardData.setData ('Text', text);
    return Swal.fire ({
      position: 'top-end',
      text: 'Copied',
      showConfirmButton: false,
      timer: 1000,
      width: '150px',
    });
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported ('copy')
  ) {
    var textarea = document.createElement ('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';
    document.body.appendChild (textarea);
    textarea.select ();
    try {
      document.execCommand ('copy');
      return Swal.fire ({
        position: 'top-end',
        text: 'Copied',
        showConfirmButton: false,
        timer: 1000,
        width: '150px',
      });
    } catch (ex) {
      console.warn ('Copy to clipboard failed.', ex);
      return false;
    } finally {
      document.body.removeChild (textarea);
    }
  }
}

document.addEventListener ('DOMContentLoaded', () => {
  (document.querySelectorAll ('.notification .delete') || [])
    .forEach ($delete => {
      const $notification = $delete.parentNode;

      $delete.addEventListener ('click', () => {
        $notification.style.display = 'none';
      });
    });
});

function connect (stream) {
  document.getElementById ('peers').style.display = 'block';
  document.getElementById ('chat').style.display = 'flex';
  document.getElementById ('noperm').style.display = 'none';
  let pc = new RTCPeerConnection ({
    iceServers: [
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: '9f4f466529e522a46a75ee20',
        credential: 'LGAmXwz+p0N4+nuN',
      },
    ],
  });
  activePeerConnections.push (pc);
  pc.ontrack = function (event) {
    if (event.track.kind === 'audio') {
      return;
    }

    col = document.createElement ('div');
    col.className = 'column is-6 peer';
    let el = document.createElement (event.track.kind);
    el.srcObject = event.streams[0];
    el.setAttribute ('controls', 'true');
    el.setAttribute ('autoplay', 'true');
    el.setAttribute ('playsinline', 'true');
    col.appendChild (el);
    document.getElementById ('noone').style.display = 'none';
    document.getElementById ('nocon').style.display = 'none';
    document.getElementById ('videos').appendChild (col);

    event.track.onmute = function (event) {
      el.play ();
    };

    event.streams[0].onremovetrack = ({track}) => {
      if (el.parentNode) {
        el.parentNode.remove ();
      }
      if (document.getElementById ('videos').childElementCount <= 3) {
        document.getElementById ('noone').style.display = 'grid';
        document.getElementById ('noonein').style.display = 'grid';
      }
    };
  };

  pc.getStats (null).then (stats => {
    stats.forEach (report => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        console.log ('Paket Kaybı: ', report.packetsLost);
      }
    });
  });

  stream.getTracks ().forEach (track => pc.addTrack (track, stream));
  console.log ('[WebSocket] Connecting to Peer Room:', RoomWebsocketAddr);
  let ws = new WebSocket (RoomWebsocketAddr);
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

  pc.oniceconnectionstatechange = () => {
    if (['disconnected', 'failed', 'closed'].includes (pc.iceConnectionState)) {
      const index = activePeerConnections.indexOf (pc);
      if (index > -1) activePeerConnections.splice (index, 1);
    }
  };

  ws.addEventListener ('error', function (event) {
    console.error ('[Peer] WebSocket Error:', evt);
    console.log ('error: ', event);
  });

  ws.onclose = function (evt) {
    console.error ('[Peer] WebSocket Close:', evt);
    console.log ('websocket has closed');
    pc.close ();
    pc = null;
    pr = document.getElementById ('videos');
    while (pr.childElementCount > 3) {
      pr.lastChild.remove ();
    }
    document.getElementById ('noone').style.display = 'none';
    document.getElementById ('nocon').style.display = 'flex';
    setTimeout (function () {
      connect (stream);
    }, 1000);
  };

  ws.onmessage = function (evt) {
    console.error ('[Peer] WebSocket Onmessage:', evt);
    let msg = JSON.parse (evt.data);
    if (!msg) {
      return console.log ('failed to parse msg');
    }

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

navigator.mediaDevices
  .getUserMedia ({
    video: {
      width: {ideal: 1280, min: 640, max: 1920},
      height: {ideal: 720, min: 360, max: 1080},
      aspectRatio: 4 / 3,
      frameRate: {ideal: 15, max: 30},
    },
    audio: {
      sampleSize: 16,
      channelCount: 2,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })
  .then (stream => {
    localStream = stream;
    audioTrack = stream.getAudioTracks ()[0];
    document.getElementById ('localVideo').srcObject = stream;
    connect (stream);
  })
  .catch (err => console.log (err));
