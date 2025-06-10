import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useContext } from 'react';

import './index.scss';

import { Card, InputGroup, Form, Button } from 'react-bootstrap';

import { getData, postData } from '~shared/scripts/requestData.js';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Slider2 } from '~shared/ui/slider2';

const TITLE = import.meta.env.VITE_TITLE;

const maxLength = 300;
const seekCooldown = 2000;

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

function Songs_Request() {
    const playerRef = useRef(null);
    const playerShadowRef = useRef(null);

    const [playing, setPlaying] = useState(false);

    const [currentMusic, setCurrentMusic] = useState();
    const [currentMusicTime, setCurrentMusicTime] = useState(0);

    const lastSeekTime = useRef();
    const seeking = useRef(false);

    const videoTickRef = useRef();

    const videoStart = useRef(0);
    const videoEnd = useRef(0);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            generateIframe(currentMusic);
        };
    }

    async function check_song(e) {
        e.preventDefault();
        const link = e.target[0].value;
        const res = await postData('/api/remote/songs/check', { link });

        if (playerRef.current) {
            playerRef.current.destroy();
        }
        if (playerShadowRef.current) {
            playerShadowRef.current.destroy();
        }

        setPlaying(false);
        setCurrentMusicTime(0);

        setCurrentMusic(res[0]);
    }

    const handlePlay = async (songId) => {
        if (playing) {
            await playerRef.current.pauseVideo();
            await playerShadowRef.current.pauseVideo();

            cancelAnimationFrame(videoTickRef.current);
            setPlaying(false);
        } else {
            if (!playerRef.current || !playerShadowRef.current) {
                await window.YTAPIReady;
                generateIframe(currentMusic);
            }

            try {
                await waitUntilReady(playerRef.current);
                await waitUntilReady(playerShadowRef.current);
            } catch (e) {
                console.warn('Players not ready:', e);
                return;
            }

            try {
                await playerRef.current.playVideo();
                await playerShadowRef.current.playVideo();
                videoTickRef.current = requestAnimationFrame(videoTick);

                setPlaying(true);
            } catch (err) {
                console.error('Error playing music:', err);
                alert('음악 재생 중 오류가 발생했습니다.');
            }
        }
    };

    function generateIframe(currentMusic) {
        if (!currentMusic) return;

        if (playerRef.current) {
            playerRef.current.destroy();
        }
        if (playerShadowRef.current) {
            playerShadowRef.current.destroy();
        }

        playerRef.current = new window.YT.Player('youtube-player', {
            host: 'https://www.youtube-nocookie.com',
            height: '337.5',
            width: '600',
            videoId: currentMusic?.videoId,
            playerVars: {
                controls: 0, // UI 버튼 숨기기 (← 이게 핵심!)
                rel: 0,
                modestbranding: 1,
                disablekb: 1,
                fs: 0, // 전체화면 버튼 제거
                iv_load_policy: 3, // 주석 비활성화
                showinfo: 0, // 정보 숨기기 (구버전 브라우저용)
                playsinline: 1, // 모바일에서 전체화면 안 되게
                autoplay: 1,
            },
            events: {
                onReady: (event) => {
                    event.target.playVideo();
                    event.target.pauseVideo();
                },
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.ENDED) {
                        event.target.seekTo(videoStart.current); // 처음으로 이동
                        event.target.playVideo(); // 재생
                    }
                },
            },
        });

        playerShadowRef.current = new window.YT.Player(
            'youtube-player-shadow',
            {
                host: 'https://www.youtube-nocookie.com',
                height: 600 * 0.9 * (9 / 16),
                width: 600 * 0.9,
                videoId: currentMusic?.videoId,
                playerVars: {
                    controls: 0, // UI 버튼 숨기기 (← 이게 핵심!)
                    rel: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    fs: 0, // 전체화면 버튼 제거
                    iv_load_policy: 3, // 주석 비활성화
                    showinfo: 0, // 정보 숨기기 (구버전 브라우저용)
                    playsinline: 1, // 모바일에서 전체화면 안 되게
                    autoplay: 1,
                },
                events: {
                    onReady: (event) => {
                        event.target.setVolume(0);
                        event.target.playVideo();
                        event.target.pauseVideo();
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            event.target.seekTo(videoStart.current); // 처음으로 이동
                            event.target.playVideo(); // 재생
                        }
                    },
                },
            }
        );
    }

    useEffect(() => {
        videoStart.current = 0;
        videoEnd.current =
            currentMusic?.duration > maxLength
                ? maxLength
                : currentMusic?.duration;
        generateIframe(currentMusic);
    }, [currentMusic?.videoId]);

    async function waitUntilReady(player, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();

            const check = () => {
                if (isPlayerReady(player)) {
                    resolve();
                } else if (Date.now() - start > timeout) {
                    reject(new Error('Player not ready within timeout'));
                } else {
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    function isPlayerReady(player) {
        try {
            return (
                player &&
                typeof player.seekTo === 'function' &&
                typeof player.getPlayerState === 'function'
            );
        } catch {
            return false;
        }
    }

    async function videoSeekTo(t) {
        const player = playerRef.current;
        const shadowPlayer = playerShadowRef.current;

        await player.seekTo(t, true);
        await shadowPlayer.seekTo(t, true);
    }

    async function videoTick() {
        const player = playerRef.current;
        const shadowPlayer = playerShadowRef.current;

        const time = player.getCurrentTime();
        const shadowTime = shadowPlayer.getCurrentTime();

        if (time > videoEnd.current || time < videoStart.current)
            videoSeekTo(videoStart.current);

        const diff = time - shadowTime;
        if (Math.abs(diff) >= 0.1) {
            const now = Date.now();

            if (!(now - lastSeekTime.current < seekCooldown)) {
                seeking.current = true;
                lastSeekTime.current = now;
                try {
                    await playerShadowRef.current.seekTo(time, true);

                    await Promise.all([
                        waitUntilPlayable(playerShadowRef.current),
                    ]);
                } catch (err) {
                    console.error('Sync error:', err);
                } finally {
                    seeking.current = false;
                }
            }
        }

        videoTickRef.current = requestAnimationFrame(videoTick);
        setCurrentMusicTime(time);
    }

    function waitUntilPlayable(player, timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            let lastTime = player.getCurrentTime();

            const check = () => {
                const state = player.getPlayerState();
                const nowTime = player.getCurrentTime();
                const progressed = nowTime > lastTime + 0.05;

                if (state === window.YT.PlayerState.PLAYING && progressed) {
                    resolve();
                } else if (Date.now() - start > timeout) {
                    console.warn('Timeout waiting for playable state');
                    resolve(); // fallback
                } else {
                    lastTime = nowTime;
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    function extractYouTubeVideoId(url) {
        const regex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);

        return match ? match[1] : null;
    }

    function formatSeconds(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }

    function onCutChange(start, end) {}

    function onCutChangeComplete(start, end) {
        videoStart.current = start;
        videoEnd.current = end;
    }

    function slide() {}

    return (
        <>
            <div id="songs_request">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Form className="song_search" onSubmit={check_song}>
                            <Card.Text className="label">노래 검색</Card.Text>
                            <InputGroup>
                                <InputGroup.Text className="bg-light text-dark">
                                    유튜브 링크
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="reason"
                                    style={{
                                        position: 'sticky',
                                        top: '0px',
                                        backgroundColor: 'white',
                                        borderBottom: '1px solid #ddd',
                                        zIndex: '10',
                                        outline: 'none',
                                        boxShadow: 'none',
                                    }}
                                />
                                <Button type="submit">검색</Button>
                            </InputGroup>
                        </Form>
                        <div className={`music ${currentMusic ? '' : 'empty'}`}>
                            <div className="music_video_wrap">
                                <div>
                                    <div className="music_video shadow">
                                        <div className="iframe-container iframe_shadow">
                                            <div id="youtube-player-shadow"></div>
                                        </div>
                                    </div>

                                    <div className="music_video">
                                        <div className="iframe-container">
                                            <div id="youtube-player"></div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`music_img_wrap ${playing ? 'playing' : ''}`}
                                >
                                    {currentMusic ? (
                                        <>
                                            <img
                                                className="music_img shadow"
                                                src={currentMusic?.imgMode}
                                                alt="music"
                                            />

                                            <img
                                                className="music_img"
                                                src={currentMusic?.imgMode}
                                                alt="music"
                                            />
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                            <div className="music_info">
                                <div className="music_title music_infoBox">
                                    <MarqueeText
                                        text={currentMusic?.title}
                                        len={40}
                                    />
                                </div>
                                <div className="music_artist music_infoBox">
                                    {currentMusic?.artist}
                                </div>
                            </div>
                            <div className="music_play">
                                <div className="play_slider">
                                    <div className="current_time music_time">
                                        <span>
                                            {formatSeconds(
                                                currentMusicTime || 0
                                            )}
                                        </span>
                                    </div>

                                    <div className="slider_wrapper">
                                        <div className="progress_bar">
                                            <Slider2
                                                min={0}
                                                max={currentMusic?.duration}
                                                defaultValue={0}
                                                setValue={currentMusicTime}
                                                onCutChangeComplete={
                                                    onCutChangeComplete
                                                }
                                                maxLength={maxLength}
                                            />
                                        </div>
                                    </div>

                                    <div className="end_time music_time">
                                        <span>
                                            {formatSeconds(
                                                currentMusic?.duration || 0
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="play_button">
                                    <div
                                        className="playpause_button music_button"
                                        onClick={() => {
                                            handlePlay(currentMusic.id);
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon
                                                icon={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_Request;
