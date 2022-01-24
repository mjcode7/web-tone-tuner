// https://stackoverflow.com/a/11646945
let MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
  // eslint-disable-next-line no-undef
  MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
  MediaStream.prototype.stop = function() {
    this.getTracks().forEach(function(track) {
      track.stop();
    });
  };
}