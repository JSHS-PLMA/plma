import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

import './index.scss';

import { Card, DropdownButton, Dropdown } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData, postData } from '~shared/scripts/requestData.js';
import moment from 'moment';
import { musicPlay } from '~shared/scripts/musicplay.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_View() {
    const navigate = useNavigate();

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [playerShadow, setPlayerShadow] = useState(null);

    const [playList, setPlayList] = useState([]);
    const [currentMusic, setCurrentMusic] = useState();
    const [currentMusicIdx, setCurrentMusicIdx] = useState();

    const [playing, setPlaying] = useState();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const handlePlay = () => {
        if (player && playerShadow) {
            if (!playing) {
                player.playVideo();
                playerShadow.playVideo();
            } else {
                player.pauseVideo();
                playerShadow.pauseVideo();
            }

            setPlaying(!playing);
        }
    };

    const onPlayerStateChange = (event) => {
        if (event.data === YT.PlayerState.ENDED) {
            setPlaying(false);
        }
    };

    async function init() {
        const data = await getData('/api/remote/songs', {
            week: '2025-05-07',
        });

        setPlayList(data);

        if (data.length > 0) setCurrentMusicIdx(0);

        // const tag = document.createElement('script');
        // tag.src = 'https://www.youtube.com/iframe_api';
        // document.body.appendChild(tag);

        // // Called by YouTube API when ready
        // window.onYouTubeIframeAPIReady = () => {
        //     const ytPlayer = new window.YT.Player('ytplayer', {
        //         events: {
        //             onReady: (e) => {
        //                 setPlayer(ytPlayer);
        //             },
        //             onStateChange: (e) => onPlayerStateChange,
        //         },
        //     });

        //     const ytPlayerShadow = new window.YT.Player('ytplayer_shadow', {
        //         events: {
        //             onReady: (e) => {
        //                 e.target.setVolume(0);
        //                 setPlayerShadow(ytPlayerShadow);
        //             },
        //             onStateChange: (e) => onPlayerStateChange,
        //         },
        //     });
        // };

        let curr = new Date();
        let first = curr - (curr.getDay() - 1) * 24 * 60 * 60 * 1000;
        let end = first + 6 * 24 * 60 * 60 * 1000;
        let firstDay = new Date(first);
        let lastDay = new Date(end);
        setStartDate(firstDay);
        setEndDate(lastDay);
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
                        songVote(x, x.id);
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

    const CustomToggle = React.forwardRef(
        ({ children, onClick, isOpen }, ref) => (
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
        )
    );

    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            const [value, setValue] = useState('');

            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value ||
                            child.props.children.toLowerCase().startsWith(value)
                    )}
                </div>
            );
        }
    );

    function cutText(text, len = 20) {
        return text
            ? text.length > len
                ? text.substring(0, len) + '...'
                : text
            : '';
    }

    const MarqueeText = ({ text, len = 20 }) => {
        if (!text) return '';
        const shouldScroll = text.length >= len;

        return (
            <div className="marquee-wrapper">
                {shouldScroll ? (
                    <div className="marquee-content">
                        <span aria-hidden="true">{text}&nbsp;&nbsp;&nbsp;</span>
                        <span>{text}&nbsp;&nbsp;&nbsp;</span>
                    </div>
                ) : (
                    <span className="normal-text">{text}</span>
                )}
            </div>
        );
    };

    function extractYouTubeVideoId(url) {
        const regex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);

        return match ? match[1] : null;
    }

    function formatSeconds(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

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

    useEffect(() => {
        if (!playList || currentMusicIdx == null) return;

        const songData = playList[currentMusicIdx];

        setCurrentMusic({
            ...songData,
            videoId: extractYouTubeVideoId(songData.ytlink),
        });

        updateTableData(playList);
    }, [playList, currentMusicIdx]);

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
                        <div className={`music ${currentMusic ? 0 : 'empty'}`}>
                            <div className="music_video_wrap">
                                <div className="music_video shadow">
                                    <div className="iframe-container iframe_shadow">
                                        <iframe
                                            id="ytplayer_shadow"
                                            src={
                                                currentMusic
                                                    ? `https://www.youtube-nocookie.com/embed/${currentMusic.videoId}?enablejsapi=1&loop=1&controls=0&playsinline=1&rel=0`
                                                    : ''
                                            }
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="music_iframe"
                                            ref={playerRef}
                                        ></iframe>
                                    </div>
                                </div>

                                <div className="music_video">
                                    <div className="iframe-container">
                                        <iframe
                                            id="ytplayer"
                                            src={
                                                currentMusic
                                                    ? `https://www.youtube-nocookie.com/embed/${currentMusic.videoId}?enablejsapi=1&loop=1&controls=0&playsinline=1&rel=0`
                                                    : ''
                                            }
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="music_iframe"
                                            ref={playerRef}
                                        ></iframe>
                                    </div>
                                </div>

                                {currentMusic ? (
                                    <div
                                        className={`music_img_wrap ${playing ? 'playing' : ''}`}
                                    >
                                        <img
                                            className="music_img"
                                            src={currentMusic?.imgMode}
                                            alt="music"
                                        />
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>

                            <div className="music_vote">
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
                                        len={45}
                                    />
                                </div>
                                <div className="music_artist music_infoBox">
                                    {currentMusic?.artist}
                                </div>
                            </div>

                            <div className="music_play">
                                <div className="play_slider">
                                    <div className="current_time music_time">
                                        <span>3:14</span>
                                    </div>

                                    <input
                                        type="range"
                                        min="0"
                                        max={(currentMusic?.duration || 0) * 10}
                                    />

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

                                    <div className="playpause_button music_button">
                                        <span>
                                            <FontAwesomeIcon icon="fa-solid fa-play" />
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
                                    show={isOpen}
                                    onToggle={(isOpen) => setIsOpen(isOpen)}
                                >
                                    <Dropdown.Toggle
                                        as={CustomToggle}
                                        isOpen={isOpen}
                                    >
                                        15주차{' '}
                                        <span>(2025.04.31. ~ 2025.05.02)</span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        as={CustomMenu}
                                        className="dropdown_menu"
                                    >
                                        <Dropdown.ItemText className="month_select">
                                            2025년 5월
                                        </Dropdown.ItemText>
                                        <Dropdown.Item>
                                            13주차 (2025.04.28. ~ 2025.05.04.)
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            14주차 (2025.05.05. ~ 2025.05.11.)
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            13주차 (2025.05.12. ~ 2025.05.18.)
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            13주차 (2025.05.12. ~ 2025.05.18.)
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            13주차 (2025.05.12. ~ 2025.05.18.)
                                        </Dropdown.Item>
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
