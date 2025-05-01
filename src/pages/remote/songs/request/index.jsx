import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

import { Card, InputGroup, Form, Button } from 'react-bootstrap';

import { getData } from '~shared/scripts/requestData.js';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_Request() {
    const navigate = useNavigate();

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const res = await getData(
            'https://www.googleapis.com/youtube/v3/videos',
            {
                part: 'snippet', // 이거 필수야
                key: 'AIzaSyDqXhlXu2mJXGTcR_h6bB2rebBKxlWUWrg',
                id: 'UyshwO7p7jw',
            }
        );

        console.log(res);
    }

    return (
        <>
            <div id="songs_request">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 신청</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">기상송 선택</Card.Text>
                        <Form>
                            <InputGroup>
                                <InputGroup.Text className="bg-light text-dark">
                                    유튜브 링크
                                </InputGroup.Text>
                                <Form.Control className="input" />
                            </InputGroup>
                            <br />

                            <Card.Text className="label">제목</Card.Text>
                            <InputGroup>
                                <InputGroup.Text className="bg-light text-dark">
                                    제목
                                </InputGroup.Text>
                                <Form.Control className="input" />
                            </InputGroup>
                            <br />

                            <Button>제출</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_Request;
