function initplayers (autoPlay = false) {
  var videojselements = document.getElementsByClassName ('video-js');
  try {
    if (videojselements) {
      for (var i = 0; i < videojselements.length; i++) {
        var element = videojselements[i];
        var loader_video = document.getElementById ('loader_video');

        if (loader_video) loader_video.style.display = 'block';

        var player = videojs (element.id);
        var poster = element.getAttribute ('poster');

        if (poster) {
          player.poster (poster);
        }

        element.addEventListener ('loadeddata', () => {
          if (loader_video) loader_video.style.display = 'none';
          console.log ('Video loaded successfully.');
        });

        element.addEventListener ('error', () => {
          if (loader_video) loader_video.style.display = 'none';
          console.error ('Error loading video.');
        });

        if (autoPlay) {
          player.play ().catch (error => {
            console.warn (
              'Autoplay prevented. Waiting for user interaction to start playback.'
            );
          });
        }
      }
    }
  } catch (err) {
    initPlayersWithPlyr (autoPlay);
  }
}

window.addEventListener ('load', function () {
  initplayers (false);
});

function initPlayersWithPlyr (autoPlay = false) {
  const videoElements = document.querySelectorAll ('.video-js');
  if (videoElements.length === 0) {
    console.warn ('No video elements found.');
    return;
  }

  videoElements.forEach (element => {
    try {
      const loader_video = document.getElementById ('loader_video');
      if (loader_video) loader_video.style.display = 'block'; // Loader_video'ı göster

      const player = new Plyr (element, {
        autoplay: autoPlay,
        muted: false,
      });

      const poster = element.getAttribute ('poster');
      if (poster) {
        player.poster = poster;
      }

      element.addEventListener ('loadeddata', () => {
        // if (loader_video) loader_video.style.display = 'none'; // Loader_video'ı gizle
        console.log ('Video loaded successfully.');
      });

      element.addEventListener('playing', () => {
        if (loader_video) loader_video.style.display = 'none';
        console.log('Video is playing.');
      });

      element.addEventListener ('error', () => {
        if (loader_video) loader_video.style.display = 'none'; // Loader_video'ı gizle
        console.error ('Error loading video.');
      });

      if (autoPlay) {
        player.play ().catch (error => {
          console.warn (
            'Autoplay prevented. Waiting for user interaction to start playback.',
            error
          );
        });
      }
    } catch (error) {
      console.error ('Error initializing Plyr:', error);

      // Fallback: Default browser video player
      element.controls = true;
      if (loader_video) loader_video.style.display = 'none';
      console.warn (
        'Fallback to default browser video player for element:',
        element
      );
    }
  });
}
