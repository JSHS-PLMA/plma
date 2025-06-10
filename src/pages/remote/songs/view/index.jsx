import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useContext } from 'react';

import useAudio from '~shared/hooks/useAudio.js';

import './index.scss';

import { Card, DropdownButton, Dropdown } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData, postData } from '~shared/scripts/requestData.js';
import moment from 'moment';
import { musicPlay } from '~shared/scripts/musicplay.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Slider } from '~shared/ui/slider';

const TITLE = import.meta.env.VITE_TITLE;

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

const CustomToggle = React.forwardRef(({ children, onClick, isOpen }, ref) => {
    return (
        <p
            className="week"
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}{' '}
            <span className="button">
                {isOpen ? <>&#x25bc;</> : <>&#x25C0;</>}
            </span>
        </p>
    );
});

function Songs_View() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const playerRef = useRef(null);
    const playerShadowRef = useRef(null);
    const canvasRef = useRef(null);
    const musicRef = useRef(null);

    const [playListMonth, setPlayListMonth] = useState(
        moment().format('YYYY-MM')
    );
    const [playListWeeks, setPlayListWeeks] = useState([]);
    const [playListWeek, setPlayListWeek] = useState();
    const [playListWeekIdx, setPlayListWeekIdx] = useState();

    const [playList, setPlayList] = useState([]);
    const [currentMusic, setCurrentMusic] = useState();
    const [currentMusicIdx, setCurrentMusicIdx] = useState();
    const [currentMusicTime, setCurrentMusicTime] = useState(0);

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    const playBarRef = useRef();

    const audioPlayer = useAudio(handleIframe);
    const seeking = useRef(false);
    const lastSeekTime = useRef(0);

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

        musicRef.current = musicPlay(canvasRef.current);
    }

    const handlePlay = async (songId) => {
        if (audioPlayer?.playing) {
            audioPlayer.pause();
        } else {
            if (audioPlayer.fileUploaded) {
                audioPlayer.resume();
                await handleIframeHard();
            } else {
                // 🎯 플레이어가 없는 경우엔 iframe부터 생성
                if (!playerRef.current || !playerShadowRef.current) {
                    await window.YTAPIReady;
                    generateIframe(currentMusic); // ⚠️ currentMusic이 null일 수 있으니 주의!
                }

                try {
                    await waitUntilReady(playerRef.current);
                    await waitUntilReady(playerShadowRef.current);
                } catch (e) {
                    console.warn('Players not ready:', e);
                    return;
                }

                try {
                    const playURL = await getData('/api/remote/songs/play', {
                        songId,
                    });
                    const { fileUrl } = playURL;

                    const audio = await audioPlayer.play(fileUrl);
                    await playerRef.current.playVideo();
                    await playerShadowRef.current.playVideo();
                    await musicRef.current.connect(audio);
                } catch (err) {
                    console.error('Error playing music:', err);
                    alert('음악 재생 중 오류가 발생했습니다.');
                }
            }
        }
    };

    async function handleIframe(time, audio) {
        musicRef.current?.draw(audio);
        setCurrentMusicTime(time);
        playBarRef.current.value = time * 10;

        if (!playerRef.current || seeking.current) return;

        try {
            await Promise.all([
                waitUntilReady(playerRef.current),
                waitUntilReady(playerShadowRef.current),
            ]);
        } catch (e) {
            console.warn('Players not ready:', e);
            return;
        }

        const current = playerRef.current.getCurrentTime();
        const diff = current - time;
        if (Math.abs(diff) < 0.2) return;

        const now = Date.now();
        if (now - lastSeekTime.current < seekCooldown) return;

        seeking.current = true;
        lastSeekTime.current = now;

        try {
            await playerRef.current.seekTo(time, true);
            await playerShadowRef.current.seekTo(time, true);

            await Promise.all([
                waitUntilPlayable(playerRef.current),
                waitUntilPlayable(playerShadowRef.current),
            ]);
        } catch (err) {
            console.error('Sync error:', err);
        } finally {
            seeking.current = false;
        }
    }

    async function handleIframeHard() {
        const time = audioPlayer.currentTime;

        playerRef.current.seekTo(time, true);
        playerShadowRef.current.seekTo(time, true);
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

    function waitUntilPlayable(player, timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            let lastTime = player.getCurrentTime();

            const check = () => {
                const state = player.getPlayerState(); // 1: playing
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
                autoplay: 1, // 자동 재생
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
                        event.target.seekTo(0); // 처음으로 이동
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
                    autoplay: 1, // 자동 재생
                    playsinline: 1, // 모바일에서 전체화면 안 되게
                },
                events: {
                    onReady: (event) => {
                        event.target.setVolume(0); // 또는 event.target.mute();
                        event.target.playVideo();
                        event.target.pauseVideo();
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            event.target.seekTo(0); // 처음으로 이동
                            event.target.playVideo(); // 재생
                        }
                    },
                },
            }
        );
    }

    useEffect(() => {
        if (currentMusic?.videoId) {
            audioPlayer.stop();

            if (window.YT && window.YT.Player) {
                generateIframe(currentMusic);
            }
        } else if (!currentMusic) {
            audioPlayer.stop();
        }
    }, [currentMusic?.videoId]);

    async function getPlayList(targetWeek) {
        const data = await getData('/api/remote/songs', {
            ...targetWeek,
        });

        setPlayList(data);

        if (data.length > 0) setCurrentMusicIdx(0);
    }

    function updateTableData(data) {
        setTableData(
            data.map((x, idx) => [
                idx + 1,
                <span className="title_wrapper">
                    <span className="song_title song_title_text">
                        {cutText(x.title, 40)}
                    </span>
                    <span className="song_artist song_title_text">
                        {x.artist}
                    </span>
                </span>,
                <span
                    className={`song_icon ${x.userVoted ? 'selected' : ''}`}
                    onClick={() => {
                        songVote(x, idx);
                    }}
                ></span>,
            ])
        );

        setColumns([
            { data: '순위', orderable: false, className: 'rank' },
            { data: '제목', orderable: false, className: 'songTitle' },
            { data: '투표', orderable: false, className: 'voted' },
        ]);
    }

    function cutText(text, len = 20) {
        return text
            ? text.length > len
                ? text.substring(0, len) + '...'
                : text
            : '';
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

    async function songClick(e, idxData) {
        if (idxData == currentMusicIdx) return;

        setCurrentMusicIdx(idxData);
    }

    async function handleMonth(dir) {
        setPlayListMonth((prev) =>
            moment(prev, 'YYYY-MM').add(dir, 'months').format('YYYY-MM')
        );
    }

    useEffect(() => {
        if (!playList || currentMusicIdx == null) return;

        const songData = playList[currentMusicIdx];

        const videoId = songData?.ytlink
            ? extractYouTubeVideoId(songData?.ytlink)
            : '';

        if (songData)
            setCurrentMusic({
                ...songData,
                videoId,
            });
        else setCurrentMusic(null);

        updateTableData(playList);
    }, [playList, currentMusicIdx]);

    async function getPlayListWeek(targetMonth) {
        const weeks = await getData('/api/remote/songs/weeks', {
            month: targetMonth,
        });

        setPlayListWeeks(weeks);
        let targetWeekIdx;
        weeks.map((x, idx) => {
            if (x.current) targetWeekIdx = idx;
        });
        targetWeekIdx ||= 0;
        setPlayListWeekIdx(targetWeekIdx);
    }

    useEffect(() => {
        getPlayListWeek(playListMonth);
    }, [playListMonth]);

    useEffect(() => {
        setPlayListWeek(playListWeeks[playListWeekIdx]);
    }, [playListWeekIdx, playListWeeks]);

    useEffect(() => {
        getPlayList(playListWeek);
    }, [playListWeek]);

    async function songVote(musicData, musicDataIdx) {
        if (!musicData) return;

        const res = await postData(`/api/remote/songs/${musicData.id}/vote`, {
            vote: !musicData.userVoted,
        });

        const afterPlayList = [...playList]; // 새 배열 생성
        afterPlayList[musicDataIdx] = {
            ...musicData,
            userVoted: !res.value,
        };
        setPlayList(afterPlayList);
    }

    return (
        <>
            <div id="songs_view">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className={`music ${currentMusic ? '' : 'empty'}`}>
                            <div className="music_video_wrap">
                                <div
                                    className={
                                        audioPlayer.playing ? '' : 'hide'
                                    }
                                >
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
                                    className={`music_img_wrap ${audioPlayer?.playing ? 'playing' : ''}`}
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

                                <div className="canvas_wrap">
                                    <canvas ref={canvasRef}></canvas>
                                </div>
                            </div>

                            <div className="music_button">
                                <button className={`edit_button`}>
                                    <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />{' '}
                                    <span></span>
                                </button>

                                <button
                                    className={`vote_button ${currentMusic?.userVoted ? 'voted' : ''}`}
                                    onClick={() => {
                                        songVote(currentMusic, currentMusicIdx);
                                    }}
                                >
                                    <FontAwesomeIcon icon="fa-solid fa-check-to-slot" />{' '}
                                    <span></span>
                                </button>
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

                                    <div className="progress_bar">
                                        <Slider
                                            min={0}
                                            max={currentMusic?.duration}
                                            defaultValue={0}
                                            setValue={currentMusicTime}
                                        />
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
                                        className={`prev_button music_button ${currentMusic && currentMusicIdx <= 0 ? 'disabled' : ''}`}
                                        onClick={(e) => {
                                            songClick(e, currentMusicIdx - 1);
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon="fa-solid fa-backward" />
                                        </span>
                                    </div>

                                    <div
                                        className="playpause_button music_button"
                                        onClick={() => {
                                            handlePlay(currentMusic.id);
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon
                                                icon={`fa-solid ${audioPlayer?.playing ? 'fa-pause' : 'fa-play'}`}
                                            />
                                        </span>
                                    </div>

                                    <div
                                        className={`next_button music_button ${currentMusic && currentMusicIdx + 1 >= playList.length ? 'disabled' : ''}`}
                                        onClick={(e) => {
                                            songClick(e, currentMusicIdx + 1);
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon="fa-solid fa-forward" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="music_selector">
                            <div className="week_selector">
                                <Dropdown
                                    className="d-inline mx-2"
                                    onToggle={(isOpen) =>
                                        setIsDropDownOpen(isOpen)
                                    }
                                >
                                    <Dropdown.Toggle
                                        as={CustomToggle}
                                        isOpen={isDropDownOpen}
                                    >
                                        {playListWeek?.weekNumber}주차{' '}
                                        <span>
                                            (
                                            {moment(
                                                playListWeek?.weekStart
                                            ).format('YYYY.MM.DD.')}{' '}
                                            ~{' '}
                                            {moment(
                                                playListWeek?.weekEnd
                                            ).format('YYYY.MM.DD.')}
                                            )
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="dropdown_menu">
                                        <Dropdown.ItemText className="month_select">
                                            <span
                                                className="month_prev month_pass"
                                                onClick={() => {
                                                    handleMonth(-1);
                                                }}
                                            ></span>
                                            <span>
                                                {moment(
                                                    playListMonth,
                                                    'YYYY-MM'
                                                ).format('YYYY년 MM월')}
                                            </span>
                                            <span
                                                className={`month_next month_pass ${!moment(playListMonth, 'YYYY-MM').isBefore(moment(), 'month') ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    handleMonth(1);
                                                }}
                                            ></span>
                                        </Dropdown.ItemText>

                                        {playListWeeks?.map((x, idx) => (
                                            <Dropdown.Item
                                                key={idx}
                                                onClick={() => {
                                                    setPlayListWeekIdx(idx);
                                                }}
                                                className={`${x.current ? 'current' : ''} ${playListWeekIdx == idx ? 'target' : ''}`}
                                            >
                                                {x.weekNumber}주차 (
                                                {moment(x.weekStart).format(
                                                    'YYYY.MM.DD.'
                                                )}{' '}
                                                ~{' '}
                                                {moment(x.weekEnd).format(
                                                    'YYYY.MM.DD.'
                                                )}
                                                )
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            <div className="playlist">
                                <DataTable
                                    data={tableData}
                                    columns={columns}
                                    options={{
                                        rowPerPage: 10,
                                        search: false,
                                        highlightRowIndex: currentMusicIdx,
                                    }}
                                    onClick={songClick}
                                    focus={currentMusicIdx || 0}
                                />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_View;
