import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import './index.scss';

import { Card, Button, InputGroup, Form, Pagination } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData } from '~shared/scripts/requestData.js';
import moment from 'moment';
import { musicPlay } from '~shared/scripts/musicplay.js';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_View() {
    const navigate = useNavigate();

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [musicImgId, setMusicImgId] = useState('TeccAtqd5K8'); //UtYBunDqp30
    const [imgMode, setImgMode] = useState('maxresdefault');

    const canvasRef = useRef(null);
    const audioRef = useRef(null);

    const playMusicRef = useRef(null);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        setTableData([
            [1, 'Oasis - Don’t Look Back In Anger'],
            [2, 'Carly Rae Jepsen - Run Away With Me'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
            [3, 'Carly Rae Jepsen ...'],
        ]);
        setColumns([
            { data: '순위', orderable: false, className: 'rank' },
            { data: '제목', orderable: false, className: 'songTitle' },
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

    return (
        <>
            <div id="songs_view">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="left">
                            <div className="date_selector">
                                <div className="month_year">
                                    <h1 className="text">
                                        <span className="month">Apr</span>{' '}
                                        <span className="year">2025</span>
                                    </h1>
                                </div>
                                <div className="weeks">
                                    <p className="text selected">
                                        <span className="week">1주차 </span>
                                        <span className="date">
                                            (Apr 4th ~ Apr 11st)
                                        </span>
                                    </p>
                                    <p className="text">
                                        <span className="week">2주차 </span>
                                        <span className="date">
                                            (Apr 4th ~ Apr 11st)
                                        </span>
                                    </p>
                                    <p className="text">
                                        <span className="week">3주차 </span>
                                        <span className="date">
                                            (Apr 4th ~ Apr 11st)
                                        </span>
                                    </p>
                                    <p className="text">
                                        <span className="week">4주차 </span>
                                        <span className="date">
                                            (Apr 4th ~ Apr 11st)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="playlist">
                                <h1 className="title">Playlist</h1>
                                <DataTable
                                    className="remoteSongsViewTable"
                                    columns={columns}
                                    data={tableData}
                                    options={{
                                        search: false,
                                        rowPerPage: 5,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="right">
                            <div className="player">
                                <div className="prev button">
                                    <span className="span1"></span>
                                    <span className="span2"></span>
                                </div>
                                <div className="music">
                                    <div className="music_img_wrap">
                                        <img
                                            className="music_img shadow"
                                            src={`http://i.ytimg.com/vi/${musicImgId}/${imgMode}.jpg`}
                                            alt="music"
                                        />

                                        <img
                                            className="music_img"
                                            src={`http://i.ytimg.com/vi/${musicImgId}/${imgMode}.jpg`}
                                            alt="music"
                                        />
                                    </div>
                                    <div className="music_title">
                                        Carly Rae Jepsen - Run Away With Me
                                    </div>

                                    <div className="music_btn">
                                        <canvas
                                            ref={canvasRef}
                                            className="canvas"
                                            onClick={playMusic}
                                        ></canvas>
                                        <audio
                                            className="audio"
                                            hidden
                                            ref={audioRef}
                                        ></audio>
                                    </div>
                                </div>
                                <div className="next button">
                                    <span className="span3"></span>
                                    <span className="span4"></span>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_View;
