import { useState, useEffect, useRef } from 'react';

import moment from 'moment';
import { getData } from '~shared/scripts/requestData';

import './index.scss';

import { Card, Badge, Button, Dropdown } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { useUser } from '~shared/scripts/userContextProvider';

function MyPoints_View() {
    const [userInfo, setUserInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const { user } = useUser();

    const userRef = useRef();

    const [optionList, setOptionList] = useState([
        { data: '상점', view: true },
        { data: '벌점', view: true },
        { data: '기타', view: true },
    ]);

    useEffect(() => {
        async function init() {
            try {
                const rawUserInfo = await getData('/api/points/user_history', {
                    userID: user.userId,
                });
                if (rawUserInfo['msg']) return;
                userRef.current = rawUserInfo;

                const { name, stuid, plus, minus } = rawUserInfo;
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
                    // { data: '선택', orderable: false },
                    { data: 'ID', className: 'dt-id' },
                    { data: '기준일자' },
                    { data: '권한자' },
                    { data: '성명 (학번)', className: 'dt-link' },
                    {
                        className: 'dt-content',
                        data: null,
                        orderBase: 5,
                    },
                    { hidden: true },
                    { data: '사유', className: 'dt-reason' },
                    { data: '반영일시' },
                    { data: '#', orderable: false },
                ]);
                setupTable(rawUserInfo);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, [user]);

    function setupTable(data) {
        if (!data) return;

        const { name, stuid, history } = data;

        if (!history) return;

        const userHistory = history.map((x, idx) => {
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
                // '',
                id,
                moment(date).format('YYYY-MM-DD'),
                teacher.name,

                <a key={`user-link-${idx}`} href="#">
                    {name} ({stuid})
                </a>,
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
                <Button
                    key={`button-objection-${idx}`}
                    variant="danger"
                    size="sm"
                >
                    이의 제기
                </Button>,
            ];
        });

        setTableData(userHistory);
        setColumns((prev) => {
            const newData = [...prev];
            newData[4].data = (
                <Dropdown onClick={optionHandler} autoClose="outside">
                    <Dropdown.Toggle size="sm">반영 내용</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {optionList.map((x, idx) => (
                            <Dropdown.Item
                                key={`dropdown-${idx}`}
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
            <div id="mypoints_view">
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
                        <br />
                        <Card.Text className="label">상벌점 기록</Card.Text>
                        <div className="tableWrap">
                            <DataTable
                                className="myPointsViewTable"
                                columns={columns}
                                data={tableData}
                                order={[0, 'desc']}
                                options={{
                                    language: {
                                        search: '통합 검색: ',
                                    },
                                }}
                            />
                        </div>
                        <Card.Text className="label">상벌점 통계</Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default MyPoints_View;
