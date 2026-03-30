import React from 'react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    width?: string | number;
    height?: string | number;
    autoPlay?: boolean;
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    width = '100%',
    height = 'auto',
    autoPlay = true,
    controls = true,
    muted = true,
    loop = false,
    className = '',
}) => {
    return (
        <div className={`video-player-container ${className}`}>
            <video
                src={src}
                poster={poster}
                width={width}
                height={height}
                autoPlay={autoPlay}
                controls={controls}
                muted={muted}
                loop={loop}
                className="video-player"
                style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '100%',
                    height: 'auto',
                    margin: '0 auto',
                }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;