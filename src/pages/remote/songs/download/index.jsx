import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import './index.scss';

import { Card, Dropdown, ToggleButton, Button } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData, postData } from '~shared/scripts/requestData.js';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useUser } from '~shared/scripts/userContextProvider';

const TITLE = import.meta.env.VITE_TITLE;

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

const Buttons = ({
    adminMode,
    isVoteActive = false,
    onVoteClick = () => {},
}) => {
    return (
        <>
            {adminMode ? (
                <ToggleButton variant="outline-dark">
                    <FontAwesomeIcon icon="fa-solid fa-sliders" /> 편집하기
                </ToggleButton>
            ) : (
                <span></span>
            )}
            <ToggleButton
                variant="outline-dark"
                type="checkbox"
                checked={isVoteActive}
                onClick={onVoteClick}
                className="vote_button"
            >
                <FontAwesomeIcon icon="fa-solid fa-check-to-slot" />{' '}
                {isVoteActive ? '투표 완료' : '투표하기'}
            </ToggleButton>
        </>
    );
};

function Songs_Download() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [playListMonth, setPlayListMonth] = useState(() => {
        const today = moment();

        const endOfMonth = moment().endOf('month');

        const startOfLastWeek = endOfMonth.clone().startOf('week');

        const isLastWeek = today.isSameOrAfter(startOfLastWeek, 'day');

        return isLastWeek
            ? today.add(1, 'months').format('YYYY-MM')
            : today.format('YYYY-MM');
    });
    const [playListWeeks, setPlayListWeeks] = useState([]);
    const [playListWeek, setPlayListWeek] = useState();
    const [playListWeekIdx, setPlayListWeekIdx] = useState();

    const [playList, setPlayList] = useState([]);
    const [currentMusic, setCurrentMusic] = useState();
    const [currentMusicIdx, setCurrentMusicIdx] = useState();

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    const [selectedSongs, setSelectedSongs] = useState([]);

    const { user } = useUser();

    const [adminMode, setAdminMode] = useState(
        user.permissions.has('editSongs')
    );

    useEffect(() => {
        init();
    }, [user]);

    async function init() {
        setAdminMode(user.permissions.has('editSongs'));
    }

    async function getPlayList(targetWeek) {
        const data = await getData('/api/remote/songs', {
            ...targetWeek,
            iamId: user.iamId,
        });

        setPlayList(data);

        if (data.length > 0) setCurrentMusicIdx(0);
    }

    function updateTableData(data) {
        data = data.sort((a, b) => {
            if (a.confirmed == b.confirmed) return b.voteCount > a.voteCount;
            else if (a.confirmed && !b.confirmed) return -1;
            else return 1;
        });

        setTableData(
            data.map((x, idx) => [
                <span>{idx + 1}</span>,
                <span className="title_wrapper">
                    <span className="song_title song_title_text">
                        {cutText(x.title, 40)}
                    </span>
                    <span className="song_artist song_title_text">
                        {x.artist}
                    </span>
                </span>,
                <span
                    className={adminMode && x.confirmed ? 'confirmed' : ''}
                ></span>,
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
            { className: 'isConfirmed' },
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
        setSelectedSongs([]);
    }, [playList, currentMusicIdx]);

    async function getPlayListWeek(targetMonth) {
        const weeks = await getData('/api/remote/songs/weeks', {
            month: targetMonth,
        });

        console.log(targetMonth, weeks);

        setPlayListWeeks(weeks);
        let targetWeekIdx = null;
        weeks.map((x, idx) => {
            if (x.target) targetWeekIdx = idx;
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
            iamId: user.iamId,
        });

        const afterPlayList = [...playList]; // 새 배열 생성
        afterPlayList[musicDataIdx] = {
            ...musicData,
            userVoted: !res.value,
        };
        setPlayList(afterPlayList);
    }

    function selectAll(songsList){
        let newSelectedSongs = [...selectedSongs];
    }

    return (
        <>
            <div id="songs_download">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="music_content">
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
                                                    className={`month_next month_pass`}
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
                                            button: [<Button onClick={}></Button>],
                                        }}
                                        onClick={songClick}
                                        focus={currentMusicIdx || 0}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_Download;
