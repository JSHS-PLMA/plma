import { useState, useEffect, useRef } from 'react';

import './index.scss';

import { Card, InputGroup, Form, Button } from 'react-bootstrap';

import { getData, postData } from '~shared/scripts/requestData.js';
import MySwal from '~shared/ui/sweetalert';

import VideoPlayer from '~shared/ui/videoPlayer';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_Request() {
    const [currentMusic, setCurrentMusic] = useState();

    const videoStart = useRef(0);
    const videoEnd = useRef(0);

    const [range, setRange] = useState([0, 0]);

    const [checked, setChecked] = useState(false);
    const [coolDown, setCoolDown] = useState(false);

    useEffect(() => {
        init();
    }, []);

    async function init() {}

    async function check_song(e) {
        e.preventDefault();
        const link = e.target[0].value;
        const res = await postData('/api/remote/songs/check', { link });

        setCurrentMusic(res[0]);
    }

    useEffect(() => {}, [currentMusic?.videoId]);

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

    async function submitSong() {
        setCoolDown(true);

        try {
            const res = await postData('/api/remote/songs', {
                ...currentMusic,
                start: range[0],
                end: range[1],
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
                            <div className="player_wrap">
                                <VideoPlayer
                                    currentMusic={currentMusic}
                                    mode="edit"
                                    setRange={setRange}
                                />
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
                                                {formatSeconds(range[0])} ~{' '}
                                                {formatSeconds(range[1])}
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
