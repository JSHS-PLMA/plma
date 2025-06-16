import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useContext } from 'react';

import './index.scss';

import { Card, InputGroup, Form, Button, Row } from 'react-bootstrap';

import { getData, postData } from '~shared/scripts/requestData.js';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Slider2 } from '~shared/ui/slider2';
import MySwal from '~shared/ui/sweetalert';

const TITLE = import.meta.env.VITE_TITLE;

const maxLength = 300;
const seekCooldown = 2000;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const [videoStartDisplay, setVideoStartDisplay] = useState(0);
    const [videoEndDisplay, setVideoEndDisplay] = useState(0);

    const [checked, setChecked] = useState(false);
    const [coolDown, setCoolDown] = useState(false);

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
                await playerShadowRef.current.playVideo();
                await playerRef.current.playVideo();
                videoTickRef.current = requestAnimationFrame(videoTick);

                setPlaying(true);
            } catch (err) {
                console.error('Error playing music:', err);
                alert('음악 재생 중 오류가 발생했습니다.');
            }
        }
    };

    async function generateIframe(currentMusic) {
        if (!currentMusic) return;

        if (playerRef.current) {
            playerRef.current.destroy();
        }
        if (playerShadowRef.current) {
            playerShadowRef.current.destroy();
        }

        playerShadowRef.current = await new window.YT.Player(
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

        playerRef.current = await new window.YT.Player('youtube-player', {
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
    }

    useEffect(() => {
        videoStart.current = 0;
        videoEnd.current =
            currentMusic?.duration > maxLength
                ? maxLength
                : currentMusic?.duration;
        generateIframe(currentMusic);

        setVideoStartDisplay(videoStart.current);
        setVideoEndDisplay(videoEnd.current);

        setCoolDown(false);
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
        const now = Date.now();

        if (Math.abs(diff) >= 0.05) {
            if (diff > 0.1) playerShadowRef.current.setPlaybackRate(1.1);
            else if (diff > 0) playerShadowRef.current.setPlaybackRate(1.05);
            else if (diff < -0.1) playerShadowRef.current.setPlaybackRate(0.9);
            else playerShadowRef.current.setPlaybackRate(0.95);
            // if (!(now - lastSeekTime.current < seekCooldown)) {
            //     seeking.current = true;
            //     lastSeekTime.current = now;
            //     try {
            //         await playerRef.current.pauseVideo();
            //         await playerShadowRef.current.pauseVideo();
            //         setPlaying(false);

            //         await playerShadowRef.current.seekTo(time, true);

            //         await delay(Math.abs(diff));

            //         await playerShadowRef.current.playVideo();
            //         await playerRef.current.playVideo();

            //         setPlaying(true);

            //         await Promise.all([
            //             waitUntilPlayable(playerShadowRef.current),
            //         ]);
            //     } catch (err) {
            //         console.error('Sync error:', err);
            //     } finally {
            //         seeking.current = false;
            //     }
            // }
        } else {
            if (playerShadowRef.current.getPlaybackRate() != 1) {
                playerShadowRef.current.setPlaybackRate(1);
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

    function onCutChangeComplete(start, end) {
        videoStart.current = start;
        videoEnd.current = end;

        setVideoStartDisplay(start);
        setVideoEndDisplay(end);
    }

    async function submitSong() {
        setCoolDown(true);

        try {
            const res = await postData('/api/remote/songs', {
                ...currentMusic,
                start: videoStart.current,
                end: videoEnd.current,
                requester: 594,
            });

            MySwal.fire({
                icon: 'success',
                title: '신청곡 등록 성공',
                text: '신청곡이 성공적으로 등록되었습니다.',
            });
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '신청곡 등록 실패',
                text: '신청곡 등록 중 문제가 발생하였습니다. 관리자에게 문의하여주세요.',
            });
        }
    }

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
                                        backgroundColor: 'white',
                                        borderBottom: '1px solid #ddd',
                                        zIndex: '10',
                                        outline: 'none',
                                        boxShadow: 'none',
                                    }}
                                    autoComplete="off"
                                />
                                <Button type="submit">검색</Button>
                            </InputGroup>
                        </Form>

                        <div className="music_content">
                            <div
                                className={`music ${currentMusic ? '' : 'empty'}`}
                            >
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

                            {currentMusic?.videoId ? (
                                <div className="music_form">
                                    <Form>
                                        <Form.Text>
                                            신청곡 제목:{' '}
                                            <span>{currentMusic?.title}</span>
                                        </Form.Text>
                                        <Form.Text>
                                            신청곡 재생 기간:{' '}
                                            <span>{currentMusic?.title}</span>
                                        </Form.Text>
                                        <Form.Text>
                                            신청곡 재생 범위:{' '}
                                            <span>
                                                {formatSeconds(
                                                    videoStartDisplay
                                                )}{' '}
                                                ~{' '}
                                                {formatSeconds(videoEndDisplay)}
                                            </span>
                                        </Form.Text>
                                    </Form>

                                    <div className="terms">
                                        <div className="section">
                                            <p className="section_title">
                                                시스템 소개
                                            </p>
                                            <p className="section_content">
                                                학생들이 신청한 노래는 일주일간
                                                투표 게시판에 올라갑니다.
                                                학생들은 지지하거나 희망하는
                                                노래에 자유롭게 투표할 수
                                                있습니다. (순위, 신청자는
                                                공개되지 않음)
                                            </p>
                                        </div>
                                        <div className="section">
                                            <p className="section_title">
                                                곡 선정
                                            </p>
                                            <p className="section_content">
                                                방송부 담당자가 투표결과를
                                                참고하여 본인이 입력한 노래와
                                                함께 최종 등록할 노래를
                                                선정합니다 (일주일 20개). 투표를
                                                하고도 다시 선정하는 까닭은
                                                기상신청곡의 취지 및 아래의
                                                운영방침에 맞는지 확인하기
                                                위함입니다. 이에 대해 이의신청은
                                                받지 않습니다.
                                            </p>
                                        </div>
                                        <div className="section">
                                            <p className="section_title">
                                                기상신청곡 운영방침
                                            </p>
                                            <ul className="section_content">
                                                <li>
                                                    기상 신청곡 제도 도입의 취지
                                                    (같은 노래의 반복 X, 일정
                                                    비율 이상의 학생에게 불쾌한
                                                    노래 X) 에 어긋나는 신청곡은
                                                    득표율에 상관없이 등록하지
                                                    아니함.
                                                </li>
                                                <li>
                                                    욕설 및 속어의 수위가 너무
                                                    높고, 너무 잘 들릴 경우
                                                    등록하지 아니함.
                                                </li>
                                                <li>
                                                    잔잔한 노래(발라드 등) 은/는
                                                    등록하지 아니함.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="submit">
                                        <Form.Check
                                            type="checkbox"
                                            label="주의사항을 모두 숙지하였으며 이에 동의합니다."
                                            id="submitCheck"
                                            onInput={() => {
                                                setChecked((prev) => !prev);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={submitSong}
                                            disabled={!checked || coolDown}
                                        >
                                            노래 신청
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_Request;
