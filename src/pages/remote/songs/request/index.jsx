import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

import { Card } from 'react-bootstrap';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_Request() {
    const navigate = useNavigate();

    return (
        <>
            <div id="songs_request">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 신청</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">기상송 선택</Card.Text>
                        <Card.Text className="label">제목</Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_Request;
