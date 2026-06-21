import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsVideoBackground() {
  const videoRef = useRef(null);
  const streamUrl = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false }); // Sandboxed env stability
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.warn('Video auto-play prevented:', e));
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.warn('Video auto-play prevented:', e));
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.6 }}
      muted
      playsInline
      loop
      crossOrigin="anonymous"
    />
  );
}
