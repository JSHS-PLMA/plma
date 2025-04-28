import { useState, useEffect, useRef } from 'react';

import moment from 'moment';
import * as XLSX from 'xlsx';

import DataTable from '~shared/ui/datatable';
import MySwal from '~shared/ui/sweetalert';

import './index.scss';

import { getData, deleteData, putData } from '~shared/scripts/requestData';

import {
    Card,
    Button,
    ButtonGroup,
    Dropdown,
    Form,
    Row,
    Col,
} from 'react-bootstrap';

function Points_History() {
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const recordsRef = useRef();
    const reasonsRef = useRef([]);

    const [dataLoading, setDataLoading] = useState(false);

    const [optionList, setOptionList] = useState([
        { data: '상점', view: true },
        { data: '벌점', view: true },
        { data: '기타', view: true },
    ]);

    const inputsRef = useRef({});

    useEffect(() => {
        async function init(allData = false) {
            try {
                setColumns([
                    { data: '선택', orderable: false },
                    { data: 'ID', className: 'dt-id' },
                    { data: '기준일자' },
                    { data: '권한자' },
                    {
                        data: '성명 (학번)',
                        className: 'dt-link',
                        searchBase: 5,
                    },
                    { hidden: true },
                    {
                        className: 'dt-content',
                        data: null,
                        orderBase: 7,
                    },
                    { hidden: true },
                    { data: '사유', className: 'dt-reason' },
                    { data: '반영일시' },
                    { data: '#', orderable: false },
                ]);
                await fetchData(allData);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    const fetchData = async (allData) => {
        const records = await getData('/api/points/history', { allData });
        const reasons = await getData('/api/reason');
        recordsRef.current = records;
        reasonsRef.current = reasons;
        setupTable(records);
    };

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
            const {
                id,
                date,
                act_date,
                teacher,
                user,
                reason_caption,
                beforeplus,
                beforeminus,
                afterplus,
                afterminus,
            } = x;
            const delta = afterplus - beforeplus - (afterminus - beforeminus);

            return [
                <Form.Check key={`checkbox-${id}`} type="checkbox">
                    <Form.Check.Input
                        type="checkbox"
                        name={`checkbox-${id}`}
                        isValid
                    />
                </Form.Check>,
                id,
                moment(date).format('YYYY-MM-DD'),
                teacher.name,
                <a
                    key={`user-link-${id}`}
                    href={`/points/user_history/${user.id}`}
                >
                    {user ? user.name : ''} ({user ? user.stuid : ''})
                </a>,
                user.name,
                <>
                    <span className={`type ${delta < 0 ? 'bad' : 'good'}`}>
                        {delta < 0 ? '벌점' : '상점'}
                    </span>
                    <span className="score">{Math.abs(delta)}점</span>
                </>,
                delta,
                reason_caption
                    ? reason_caption.length > 30
                        ? reason_caption.substring(0, 30) + '...'
                        : reason_caption
                    : '',
                moment(act_date).format('YYYY-MM-DD'),
                <>
                    <Button
                        className="rowButton"
                        variant="primary"
                        size="sm"
                        onClick={() => handleClickEdit(x)}
                    >
                        수정
                    </Button>
                    <Button
                        className="rowButton"
                        variant="danger"
                        size="sm"
                        onClick={() => handleClickDelete(x)}
                    >
                        삭제
                    </Button>
                </>,
            ];
        });

        setTableData(dataList);
        setColumns((prev) => {
            const newData = [...prev];
            newData[6].data = (
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

        const finalData = recordsRef.current.filter((data) => {
            const { beforeplus, beforeminus, afterplus, afterminus } = data;
            const delta = afterplus - beforeplus - (afterminus - beforeminus);

            const type = delta < 0 ? 1 : 0;

            return arr[type].view;
        });

        setOptionList(arr);
        setupTable(finalData);
    }

    function handleSelectReason(e) {
        const reasonId = e.target.value;
        const title = reasonsRef.current.find((x) => x.id == reasonId).title;
        document.getElementById('reason_caption').value = title; // 살짝 좋지 않은 방법

        inputsRef.current = {
            ...inputsRef.current,
            reason: reasonId,
            reason_caption: title,
        };
    }

    async function refreshData() {
        if (dataLoading) return;

        setDataLoading(true);
        await fetchData();
        setDataLoading(false);
    }

    async function allData() {
        if (dataLoading) return;

        setDataLoading(true);
        await fetchData(true);
        setDataLoading(false);
    }

    const exportExcel = () => {
        const data = tableData.map((x) => {
            return {
                ID: x[1],
                기준일자: x[2],
                권한자: x[3],
                '성명 (학번)': x[4].props.children.join(''),
                반영내용: x[7],
                사유: x[8],
                반영일시: x[9],
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(
            wb,
            `상벌점 조회 결과 (${moment().format('YYYY-MM-DD')}).xlsx`
        );
    };

    async function handleClickDelete(x) {
        const res = await MySwal.fire({
            title: '정말 삭제하시겠습니까?',
            icon: 'question',
            confirmButtonText: '확인',
            showCancelButton: true,
            cancelButtonText: '취소',
        });

        if (res.isConfirmed) {
            try {
                await deleteData(`/api/points/history/${x.id}`);
                await fetchData();
                MySwal.fire({
                    icon: 'success',
                    title: '상벌점 삭제 성공',
                    text: '상벌점이 성공적으로 삭제되었습니다.',
                });
            } catch (error) {
                console.error(error);
                MySwal.fire({
                    icon: 'error',
                    title: '상벌점 삭제 실패',
                    text: '상벌점 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                });
            }
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target; // name 속성 가져오기

        inputsRef.current = {
            ...inputsRef.current,
            [name]: value,
        };
    };

    const handleClickEdit = async (x) => {
        const {
            id,
            // date,
            act_date,
            // teacher,
            // user,
            reason,
            reason_caption,
            beforeplus,
            beforeminus,
            afterplus,
            afterminus,
        } = x;
        const delta = afterplus - beforeplus - (afterminus - beforeminus);
        const pointType = delta < 0 ? 'bad' : 'good';

        inputsRef.current = {};

        const modalContent = (
            <Form className="edit-form">
                <Row>
                    <Col>
                        <Form.Group controlId="point_type">
                            <Form.Label>상벌점 유형</Form.Label>
                            <Form.Select
                                defaultValue={pointType}
                                name="pointType"
                                onChange={handleChange}
                            >
                                <option value="good">상점</option>
                                <option value="bad">벌점</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="act_date">
                            <Form.Label>기준 일자</Form.Label>
                            <Form.Control
                                type="date"
                                defaultValue={moment(act_date).format(
                                    'YYYY-MM-DD'
                                )}
                                name="act_date"
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="point">
                            <Form.Label>점수</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="점수를 입력하세요"
                                min="0"
                                defaultValue={Math.abs(delta)}
                                name="point"
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="reason">
                            <Form.Label>기준 규정</Form.Label>
                            <Form.Select
                                defaultValue={reason}
                                onChange={handleSelectReason}
                                name="reason"
                            >
                                {reasonsRef.current.map((item) => {
                                    return (
                                        <option
                                            key={`option-${item.id}`}
                                            value={item.id}
                                        >
                                            {item.title}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="reason_caption">
                            <Form.Label>사유</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="사유를 입력하세요"
                                defaultValue={reason_caption}
                                name="reason_caption"
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        );

        try {
            const res = await MySwal.fire({
                title: '상벌점 수정',
                html: modalContent,
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                preConfirm: () => {
                    const {
                        pointType,
                        point,
                        reason,
                        act_date,
                        reason_caption,
                    } = inputsRef.current;

                    if (
                        !(
                            pointType ||
                            point ||
                            reason ||
                            act_date ||
                            reason_caption
                        )
                    ) {
                        MySwal.showValidationMessage(
                            '적어도 하나는 수정해주세요.'
                        );
                        return false;
                    }

                    return { ...inputsRef.current, point: parseInt(point) };
                },
            });

            if (res.isConfirmed) {
                // const { pointType, point, reason, act_date, reason_caption } =
                //     res.value;

                await putData(`/api/points/history/${id}`, res.value);
                await fetchData();

                MySwal.fire({
                    icon: 'success',
                    title: '상벌점 수정 성공',
                    text: '상벌점이 성공적으로 수정되었습니다.',
                });
            }
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '상벌점 수정 실패',
                text: '상벌점 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
    };

    return (
        <>
            <div id="points_history">
                <Card>
                    <Card.Header>
                        <Card.Title>상벌점 기록</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="tableWrap">
                            <Card.Text className="label">상벌점 기록</Card.Text>
                            <br />
                            <DataTable
                                className="historyTable"
                                columns={columns}
                                data={tableData}
                                order={[1, 'desc']}
                                options={{
                                    language: {
                                        search: '통합 검색: ',
                                    },
                                    button: [
                                        <Button
                                            key="button-refresh"
                                            className="tableButton"
                                            onClick={refreshData}
                                            disabled={dataLoading}
                                            variant="primary"
                                        >
                                            새로고침
                                        </Button>,
                                        <Button
                                            key="button-alldata"
                                            className="tableButton"
                                            onClick={allData}
                                            disabled={dataLoading}
                                            variant="primary"
                                        >
                                            전체 기록 조회
                                        </Button>,
                                        ///excel export button
                                        <ButtonGroup
                                            key="button-excel"
                                            aria-label="Basic example"
                                        >
                                            <Button
                                                onClick={exportExcel}
                                                variant="success"
                                            >
                                                Excel
                                            </Button>
                                            <Button>7</Button>
                                        </ButtonGroup>,
                                    ],
                                }}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Points_History;
