import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

import './index.scss';

import { Card, DropdownButton, Dropdown } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData } from '~shared/scripts/requestData.js';
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

    const [musicImgId, setMusicImgId] = useState('TeccAtqd5K8');
    const [imgMode, setImgMode] = useState('maxresdefault');

    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [playerShadow, setPlayerShadow] = useState(null);

    const [voted, setVoted] = useState(true);

    const [playing, setPlaying] = useState();

    const [isOpen, setIsOpen] = useState(false);

    const canvasRef = useRef(null);
    const audioRef = useRef(null);

    const playMusicRef = useRef(null);

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
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        // Called by YouTube API when ready
        window.onYouTubeIframeAPIReady = () => {
            const ytPlayer = new window.YT.Player('ytplayer', {
                events: {
                    onReady: (e) => {
                        setPlayer(ytPlayer);
                    },
                    onStateChange: (e) => onPlayerStateChange,
                },
            });

            const ytPlayerShadow = new window.YT.Player('ytplayer_shadow', {
                events: {
                    onReady: (e) => {
                        e.target.setVolume(0);
                        setPlayerShadow(ytPlayerShadow);
                    },
                    onStateChange: (e) => onPlayerStateChange,
                },
            });
        };

        setTableData([
            [
                1,
                <p>
                    <span className="song_title">
                        Oasis - Don't Look Back In Anger
                    </span>
                    <span className="song_artist">Oasis</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                2,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                3,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                4,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                5,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                6,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [
                7,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon selected"></span>,
            ],
            [
                8,
                <p>
                    <span className="song_title">
                        Carly Rae Jepsen - Run Away with me
                    </span>
                    <span className="song_artist">Carly Rae Jepsen</span>
                </p>,
                <span className="song_icon"></span>,
            ],
            [9, 'Carly Rae Jepsen ...'],
        ]);
        setColumns([
            { data: '순위', orderable: false, className: 'rank' },
            { data: '제목', orderable: false, className: 'songTitle' },
            { data: '투표', orderable: false, className: 'voted' },
        ]);

        let curr = new Date();
        let first = curr - (curr.getDay() - 1) * 24 * 60 * 60 * 1000;
        let end = first + 6 * 24 * 60 * 60 * 1000;
        let firstDay = new Date(first);
        let lastDay = new Date(end);
        setStartDate(firstDay);
        setEndDate(lastDay);

        playMusicRef.current = musicPlay(canvasRef.current, audioRef.current);
    }

    async function playMusic() {
        const audio = audioRef.current;
        const canvas = canvasRef.current;

        const func = playMusicRef.current;

        await audio.load();
        audio.src = '/song1.mp3';

        func.playMusic();
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

    function songClick(e, idxData, idxRow, idxTd) {
        console.log(idxData, idxTd);
    }

    return (
        <>
            <div id="songs_view">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="music">
                            <div className="music_video_wrap">
                                <div className="music_video shadow">
                                    <div className="iframe-container iframe_shadow">
                                        <iframe
                                            id="ytplayer_shadow"
                                            src={`https://www.youtube-nocookie.com/embed/${musicImgId}?enablejsapi=1&loop=1&controls=0&playsinline=1&rel=0`}
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
                                            src={`https://www.youtube-nocookie.com/embed/${musicImgId}?enablejsapi=1&loop=1&controls=0&playsinline=1&rel=0`}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="music_iframe"
                                            ref={playerRef}
                                        ></iframe>
                                    </div>
                                </div>

                                <div
                                    className={`music_img_wrap ${playing ? 'playing' : ''}`}
                                >
                                    <img
                                        className="music_img"
                                        src={`http://i.ytimg.com/vi/${musicImgId}/${imgMode}.jpg`}
                                        alt="music"
                                    />
                                </div>
                            </div>

                            <div className="music_vote">
                                <button
                                    className={`vote_button ${voted ? 'voted' : ''}`}
                                >
                                    <FontAwesomeIcon icon="fa-solid fa-check-to-slot" />{' '}
                                    {voted ? '투표 완료' : '투표하기'}
                                </button>
                            </div>

                            <div className="music_info">
                                <div className="music_title">
                                    Oasis - Don’t Look Back In Anger
                                </div>
                                <div className="music_artist">
                                    {playing ? 'Oasis' : 'Carly Rae Jepsen'}
                                </div>
                            </div>

                            <div className="music_play">
                                <canvas
                                    ref={canvasRef}
                                    width="300"
                                    height="300"
                                    onClick={handlePlay}
                                />
                                <audio ref={audioRef} controls></audio>
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
                                        rowPerPage: 8,
                                        search: false,
                                    }}
                                    onClick={songClick}
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
