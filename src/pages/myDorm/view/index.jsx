import { useState, useEffect } from 'react';

import { Card } from 'react-bootstrap';
import { getData } from '~shared/scripts/requestData';
import './index.scss';

const userID = 34084; // 32067

function MyDorm_View() {
    const [dorm, setDorm] = useState();
    useEffect(() => {
        async function init() {
            try {
                const mydorm = await getData('/api/dorms/myDorm', {
                    userID,
                });
                console.log(mydorm);
                setDorm(mydorm);
            } catch (error) {
                console.error(error);
            }
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
                        {dorm ? (
                            <>
                                <article className="dormInfo">
                                    <h3>배정현황</h3>
                                    <ul>
                                        <li>
                                            학기: {dorm.year} {dorm.semester}
                                            학기
                                        </li>
                                        <li>
                                            이름(학번): {dorm.name}({dorm.stuid}
                                            )
                                        </li>
                                        <li>
                                            배정기숙사: {dorm.dorm_name}{' '}
                                            {dorm.room_name}호
                                        </li>
                                        <li>침대위치: {dorm.bedPosition}</li>
                                    </ul>
                                </article>
                                <article className="rommateInfo">
                                    <h4>룸메이트</h4>
                                    <ul>
                                        {dorm.roommates &&
                                        dorm.roommates.length > 0 ? (
                                            dorm.roommates.map(
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
                        ) : (
                            '기숙사 배정 정보가 없습니다.'
                        )}
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default MyDorm_View;
