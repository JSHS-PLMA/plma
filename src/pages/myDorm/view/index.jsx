import { useState, useEffect } from 'react';

import { Card } from 'react-bootstrap';
import { getData } from '~shared/scripts/requestData';
import './index.scss';

const userID = 34084; // 32067

function MyDorm_View() {
    const [dormInfo, setDormInfo] = useState({});
    useEffect(() => {
        async function init() {
            const data = await getData('/api/dorms/myDorm', {
                userID,
            });
            setDormInfo(data);
            console.log(data);
        }

        init();
    }, []);

    return (
        <>
            <div id="mydorm_view">
                <Card>
                    <Card.Header>
                        <Card.Title>내 기숙사 현황</Card.Title>
                    </Card.Header>
                    {/* use ul / li, 표시될 정보: 이름(학번), 호실, 침대위치 */}
                    <Card.Body>
                        <>
                            <article className="dormInfo">
                                <h3>배정현황</h3>
                                <ul>
                                    <li>
                                        학기: {dormInfo.year}{' '}
                                        {dormInfo.semester}학기
                                    </li>
                                    <li>
                                        이름(학번): {dormInfo.name}(
                                        {dormInfo.stuid})
                                    </li>
                                    <li>
                                        배정기숙사: {dormInfo.dorm_name}{' '}
                                        {dormInfo.room_name}호
                                    </li>
                                    <li>침대위치: {dormInfo.bedPosition}</li>
                                </ul>
                            </article>
                            <article className="rommateInfo">
                                <h4>룸메이트</h4>
                                <ul>
                                    {dormInfo.roommates &&
                                    dormInfo.roommates.length > 0 ? (
                                        dormInfo.roommates.map(
                                            (roommate, index) => (
                                                <li key={index}>
                                                    {roommate.name}(
                                                    {roommate.stuid}):{' '}
                                                    {/* phone number format */}
                                                    {roommate.phone_number.replace(
                                                        /(\d{3})(\d{4})(\d{4})/,
                                                        '$1-$2-$3'
                                                    )}
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <li>룸메이트 정보가 없습니다.</li>
                                    )}
                                </ul>
                            </article>
                        </>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default MyDorm_View;
