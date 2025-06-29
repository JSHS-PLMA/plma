import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import moment from 'moment';
import { getData } from '~shared/scripts/requestData';

import './index.scss';

import { Card, Badge, Dropdown } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

function Points_UserHistory() {
    const params = useParams();

    const [userInfo, setUserInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const userRef = useRef();

    const [optionList, setOptionList] = useState([
        { data: '상점', view: true },
        { data: '벌점', view: true },
        { data: '기타', view: true },
    ]);

    useEffect(() => {
        async function init() {
            try {
                const { userID } = params;
                const user = await getData('/api/points/user_history', {
                    userID,
                });
                if (user['msg']) return;
                userRef.current = user;

                const { name, stuid, plus, minus /*history*/ } = user;
                const etc = 0;

                setUserInfo({
                    name,
                    stuid,
                    plus,
                    minus,
                    etc,
                    points: plus - minus,
                });
                setColumns([
                    { data: '선택', orderable: false },
                    { data: 'ID', className: 'dt-id' },
                    { data: '기준일자' },
                    { data: '권한자' },
                    { data: '성명 (학번)', className: 'dt-link' },
                    {
                        className: 'dt-content',
                        data: null,
                        orderBase: 6,
                    },
                    { hidden: true },
                    { data: '사유', className: 'dt-reason' },
                    { data: '반영일시' },
                ]);
                setupTable(user);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    function setupTable(data) {
        if (!data) return;

        const { name, stuid, history } = data;

        if (!history) return;

        const userHistory = history.map((x) => {
            const {
                id,
                date,
                act_date,
                teacher,
                reason_caption,
                beforeplus,
                beforeminus,
                afterplus,
                afterminus,
            } = x;
            const delta = afterplus - beforeplus - (afterminus - beforeminus);

            return [
                '',
                id,
                moment(date).format('YYYY-MM-DD'),
                teacher.name,
                `${name} (${stuid})`,
                <>
                    <span className={`type ${delta < 0 ? 'bad' : 'good'}`}>
                        {delta < 0 ? '벌점' : '상점'}
                    </span>
                    <span className="score">{Math.abs(delta)}점</span>
                </>,
                delta,
                reason_caption.length > 40
                    ? reason_caption.substring(0, 40) + '...'
                    : reason_caption,
                moment(act_date).format('YYYY-MM-DD'),
            ];
        });

        setTableData(userHistory);
        setColumns((prev) => {
            const newData = [...prev];
            newData[5].data = (
                <Dropdown onClick={optionHandler} autoClose="outside">
                    <Dropdown.Toggle
                        variant="primary"
                        id="dropdown-basic"
                        size="sm"
                    >
                        반영 내용
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {optionList.map((x, idx) => (
                            <Dropdown.Item
                                key={idx}
                                active={x.view}
                                onClick={(e) =>
                                    optionSelect(e, idx, optionList)
                                }
                            >
                                {x.data}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            );
            return newData;
        });
    }

    function optionHandler(e) {
        e.stopPropagation();
    }

    function optionSelect(e, idx, list) {
        e = e || window.event;

        const arr = [...list];
        arr[idx].view = !arr[idx].view;

        const { history } = userRef.current;

        const finalData = history.filter((data) => {
            const { beforeplus, beforeminus, afterplus, afterminus } = data;
            const delta = afterplus - beforeplus - (afterminus - beforeminus);

            const type = delta < 0 ? 1 : 0;

            return arr[type].view;
        });

        setOptionList(arr);
        setupTable({
            ...userRef.current,
            history: finalData,
        });
    }

    return (
        <>
            <div id="points_userHistory">
                <Card>
                    <Card.Header>
                        <Card.Title>내 상벌점</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <br />
                        <h1 className="label myPoint">
                            <span className="sum">{userInfo.points}점</span>
                            <Badge className="plus">
                                상점: +{userInfo.plus}
                            </Badge>
                            <Badge className="minus">
                                벌점: -{userInfo.minus}
                            </Badge>
                            <Badge className="etc">기타: {userInfo.etc}</Badge>
                        </h1>

                        <div className="tableWrap">
                            <br />
                            <Card.Text className="label">상벌점 기록</Card.Text>
                            <DataTable
                                className="myPointsViewTable"
                                columns={columns}
                                data={tableData}
                                order={[1, 'desc']}
                                options={{
                                    language: {
                                        search: '통합 검색: ',
                                    },
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Points_UserHistory;
