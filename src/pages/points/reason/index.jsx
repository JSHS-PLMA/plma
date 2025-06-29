import { useState, useEffect, useRef } from 'react';

import MySwal from '~shared/ui/sweetalert';

import { getData, putData, deleteData } from '~shared/scripts/requestData';

import { Card, Button, Dropdown, Form, Row, Col } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import './index.scss';

function Points_Reason() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const dataRef = useRef();

    const [optionList, setOptionList] = useState([
        { data: '상점', view: true },
        { data: '벌점', view: true },
        { data: '기타', view: true },
    ]);

    useEffect(() => {
        async function init() {
            try {
                setColumns([
                    { data: '번호' },
                    { data: '사유', className: 'dt-reason' },
                    {
                        data: null,
                        className: 'dt-content',
                        orderBase: 3,
                    },
                    { hidden: true },
                    { data: '#', className: 'dt-button' },
                ]);
                await fetchReasons();
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    const fetchReasons = async () => {
        const reasons = await getData('/api/points/reason');
        dataRef.current = reasons;

        const filteredReasons = reasons.filter((x) => x.dpc == 0); // dpc가 1이면 삭제된 사유
        setupTable(filteredReasons);
    };

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
            const { id, title, plus, minus } = x;
            const delta = plus - minus;

            return [
                id,
                title,
                <>
                    <span className={`type ${delta < 0 ? 'bad' : 'good'}`}>
                        {delta < 0 ? '벌점' : '상점'}
                    </span>
                    <span className="score">{Math.abs(delta)}점</span>
                </>,
                delta,
                <>
                    <Button
                        className="editButton"
                        variant="primary"
                        size="sm"
                        onClick={() => handleClickEdit(x)}
                    >
                        수정
                    </Button>
                    <Button
                        className="editButton"
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
            newData[2].data = (
                <Dropdown onClick={optionHandler} autoClose="outside">
                    <Dropdown.Toggle id="dropdown-basic" size="sm">
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

        const finalData = dataRef.current.filter((data) => {
            const { plus, minus } = data;
            const delta = plus - minus;

            const type = delta < 0 ? 1 : 0;

            return arr[type].view;
        });

        setOptionList(arr);
        setupTable(finalData);
        setColumns((prev) => {
            const newData = [...prev];
            newData[2].data = (
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

    /// handle delete
    const handleClickDelete = async (x) => {
        const { id } = x;
        try {
            const res = await MySwal.fire({
                title: `정말로 삭제하시겠습니까?`,
                showCancelButton: true,
                confirmButtonText: '삭제',
                cancelButtonText: '취소',
            });

            if (res.isConfirmed) {
                await deleteData(`/api/points/reason/${id}`);
                await fetchReasons();

                MySwal.fire({
                    icon: 'success',
                    title: '삭제 성공',
                    text: '상벌점 사유를 성공적으로 삭제했습니다.',
                });
            }
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '상벌점 사유 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
    };

    const handleClickEdit = async (x) => {
        const { id, title, plus, minus } = x;
        try {
            const res = await MySwal.fire({
                title: '사유 수정',
                html: (
                    <Form className="edit-form">
                        <Row>
                            <Col>
                                <Form.Group controlId="title">
                                    <Form.Label>사유</Form.Label>
                                    <Form.Control
                                        placeholder="사유를 입력하세요"
                                        defaultValue={title}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="plus">
                                    <Form.Label>상점</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="상점을 입력하세요"
                                        defaultValue={plus}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="minus">
                                    <Form.Label>벌점</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="벌점을 입력하세요"
                                        defaultValue={minus}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                ),
                showCancelButton: true,
                confirmButtonText: '수정',
                cancelButtonText: '취소',
            });

            if (res.isConfirmed) {
                const reasonTitle =
                    document.getElementById('reasonTitle').value;
                const plus = document.getElementById('plus').value;
                const minus = document.getElementById('minus').value;

                await putData(`/api/points/reason/${id}`, {
                    id,
                    title: reasonTitle,
                    plus,
                    minus,
                });
                await fetchReasons();

                MySwal.fire({
                    icon: 'success',
                    title: '수정 성공',
                    text: '상벌점 사유를 성공적으로 수정했습니다.',
                });
            }
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '수정 실패',
                text: '상벌점 사유 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
    };

    return (
        <>
            <div id="points_reason">
                <Card>
                    <Card.Header>
                        <Card.Title>상벌점 사유 관리</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="tableWrap">
                            <Card.Text className="label">
                                상벌점 사유 현황
                            </Card.Text>

                            <DataTable
                                className="pointsReasonTable"
                                columns={columns}
                                data={tableData}
                                options={{
                                    language: {
                                        search: '사유 검색: ',
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

export default Points_Reason;
