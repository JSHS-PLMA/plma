import { useEffect, useState, useRef } from 'react';
import { Slider2 } from '~shared/ui/slider2';

import './index.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const maxLength = 5 * 60;

const MarqueeText = ({ text, len = 20 }) => {
    if (!text) return '';
    const shouldScroll = text.length >= len;

    return (
        <div className="marquee-wrapper">
            {shouldScroll ? (
                <div className="marquee-content">
                    <span aria-hidden="true">{text}</span>
                    <span>{text}</span>
                </div>
            ) : (
                <span className="normal-text">{text}</span>
            )}
        </div>
    );
};

async function generateIframe(currentMusic, playerRef, rangeRef, videoSeekTo) {
    if (!currentMusic || !window.YT) return;

    for (let x of playerRef.current) {
        if (x) x.destroy();
    }

    playerRef.current = [];

    const playerConfigs = [
        ['youtube-player', 600],
        ['youtube-player-shadow', 600 * 0.9],
    ];

    const readyPromises = playerConfigs.map(([id, width]) => {
        return new Promise((resolve) => {
            const player = new window.YT.Player(id, {
                host: 'https://www.youtube-nocookie.com',
                height: width * (9 / 16),
                width: width,
                videoId: currentMusic.videoId,
                playerVars: {
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    showinfo: 0,
                    playsinline: 1,
                },
                events: {
                    onReady: (event) => {
                        if (id == 'youtube-player-shadow')
                            event.target.setVolume(0);
                        else event.target.setVolume(100);
                        event.target.playVideo();
                        event.target.pauseVideo();
                        resolve();
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            player.seekTo(rangeRef.current[0], true);
                            player.playVideo();
                            videoSeekTo(rangeRef.current[0]);
                        }
                    },
                },
            });

            playerRef.current.push(player);
        });
    });

    await Promise.all(readyPromises);
}

async function handleVideo(playerRef, videoTickRef, playing, videoTick) {
    const state =
        playerRef.current.length === 2 &&
        playerRef.current.every((player) => player && player.playVideo);

    if (!state) return -1;

    if (playing) {
        playerRef.current.forEach(async (player) => {
            if (player && player.pauseVideo) {
                await player.pauseVideo();
            }
        });

        cancelAnimationFrame(videoTickRef.current);

        return 0;
    } else {
        playerRef.current.forEach(async (player) => {
            await player.playVideo();
        });
        videoTickRef.current = requestAnimationFrame(videoTick);

        return 1;
    }
}

function VideoPlayer({
    currentMusic,
    mode,
    setRange = () => {},
    Buttons = <></>,
}) {
    const playerRef = useRef([]);
    const rangeRef = useRef([]);

    const videoTickRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const isDragging = useRef(false);

    const [currentMusicTime, setCurrentMusicTime] = useState(0);
    const currentMusicTimeRef = useRef(0);

    const seekRef = useRef(null);

    async function init() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            generateIframe(currentMusic, playerRef, rangeRef, videoSeekTo);
        };
    }

    async function handlePlay() {
        if (!(playerRef && playerRef.current.length === 2)) return;

        let res = await handleVideo(
            playerRef,
            videoTickRef,
            playing,
            videoTick
        );

        while (res === -1) {
            console.warn('Retrying to play video...');
            await generateIframe(
                currentMusic,
                playerRef,
                rangeRef,
                videoSeekTo
            );
            res = await handleVideo(
                playerRef,
                videoTickRef,
                playing,
                videoTick
            );
        }

        setPlaying(res === 1);
    }

    async function videoTick() {
        const [player, playerShadow] = playerRef.current;
        const [start, end] = rangeRef.current;

        const time = player.getCurrentTime();
        const shadowTime = playerShadow.getCurrentTime();

        if (!isDragging.current) setCurrentMusicTime(time);
        if (time > end || time < start) {
            currentMusicTimeRef.current = start;
            await videoSeekTo(start);
        }

        const diff = time - shadowTime;

        if (Math.abs(diff) >= 0.05) {
            playerShadow.setPlaybackRate(1 + Math.round(diff / 0.05) * 0.05);
        } else {
            if (playerShadow.getPlaybackRate() != 1)
                playerShadow.setPlaybackRate(1);
        }

        videoTickRef.current = requestAnimationFrame(videoTick);
    }

    async function videoSeekTo(t) {
        t = Number(t);

        if (seekRef.current == null || seekRef.current == t) {
            seekRef.current = t;
        } else {
            seekRef.current = t;
            if (seekRef.current != t) return;
        }

        const promises = playerRef.current.map((player) => {
            if (player && player.seekTo) {
                return new Promise((resolve) => {
                    player.seekTo(seekRef.current, true);

                    const check = () => {
                        const currentTime = player.getCurrentTime();
                        if (seekRef.current == null) return resolve();
                        if (Math.abs(currentTime - seekRef.current) < 0.1) {
                            seekRef.current = null;
                            return resolve();
                        } else requestAnimationFrame(check);
                    };

                    requestAnimationFrame(check);
                });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
    }

    async function onInput(time) {
        isDragging.current = true;
    }

    async function onInputComplete(time) {
        const [start, end] = rangeRef.current;
        if (time < start || time > end) {
            time = start;
        }
        await videoSeekTo(time);
        setCurrentMusicTime(time);
        currentMusicTimeRef.current = time;
        isDragging.current = false;
    }

    async function onCutChangeComplete(start, end) {
        rangeRef.current = [start, end];
        setRange([start, end]);
    }

    useEffect(() => {
        if (playerRef && rangeRef) init();
    }, [playerRef, rangeRef, currentMusic?.videoId]);

    useEffect(() => {
        if (currentMusic?.videoId) {
            cancelAnimationFrame(videoTickRef.current);

            if (window.YT && window.YT.Player) {
                const { start, end } = currentMusic;

                rangeRef.current = [start, end];
                setRange([start, end]);

                generateIframe(currentMusic, playerRef, rangeRef, videoSeekTo);
            }
        } else if (!currentMusic) {
            cancelAnimationFrame(videoTickRef.current);
        }
        setCurrentMusicTime(0);
        setPlaying(false);
    }, [currentMusic?.videoId]);

    return (
        <>
            <div
                className={`videoPlayer ${currentMusic?.videoId ? '' : 'hidden'}`}
            >
                <div className={`player ${playing ? 'playing' : ''}`}>
                    <div className="video_wrap wrap">
                        <div className="youtube-player shadow">
                            <div className="iframe-container">
                                <div id="youtube-player-shadow"></div>
                            </div>
                        </div>
                        <div className="youtube-player">
                            <div className="iframe-container">
                                <div id="youtube-player"></div>
                            </div>
                        </div>
                    </div>
                    <div className="img_wrap wrap">
                        <div className="youtube-player shadow">
                            <div className="img-container">
                                <img
                                    className="youtube-img"
                                    src={currentMusic?.imgMode}
                                    alt="music"
                                />
                            </div>
                        </div>
                        <div className="youtube-player">
                            <div className="img-container">
                                <img
                                    className="youtube-img"
                                    src={currentMusic?.imgMode}
                                    alt="music"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="button_wrap wrap">{Buttons}</div>

                <div className="info">
                    <div className="video-title video-infoBox">
                        <MarqueeText text={currentMusic?.title} len={40} />
                    </div>
                    <div className="video-artist video-infoBox">
                        <MarqueeText text={currentMusic?.artist} len={40} />
                    </div>
                </div>

                <div className="controls">
                    <div className="slider_wrap wrap">
                        <Slider2
                            min={0}
                            max={currentMusic?.duration || 1 - 1}
                            defaultValue={0}
                            setValue={currentMusicTime}
                            onInput={onInput}
                            onInputComplete={onInputComplete}
                            onCutChangeComplete={onCutChangeComplete}
                            mode={mode}
                            disabled={!currentMusic?.videoId}
                        />
                    </div>

                    <div className="play_button">
                        <div
                            className={`prev_button music_button ${true ? 'disabled' : ''}`}
                            onClick={(e) => {
                                songClick(e, 0);
                            }}
                        >
                            <span>
                                <FontAwesomeIcon icon="fa-solid fa-backward" />
                            </span>
                        </div>

                        <div
                            className="playpause_button music_button"
                            onClick={handlePlay}
                        >
                            <span>
                                <FontAwesomeIcon
                                    icon={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`}
                                />
                            </span>
                        </div>

                        <div
                            className={`next_button music_button ${true ? 'disabled' : ''}`}
                            onClick={(e) => {
                                songClick(e, 1);
                            }}
                        >
                            <span>
                                <FontAwesomeIcon icon="fa-solid fa-forward" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VideoPlayer;
