import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import axios from 'axios';

import MySwal from '~shared/ui/sweetalert';

import { getData } from '~shared/scripts/requestData';

import { Card, Button, Dropdown, Form, Row, Col } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

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
        init();
    }, []);

    async function init() {
        const data = await getData('/api/points/reason');

        dataRef.current = data;

        const filteredData = data.filter((x) => {
            /// x.dpc가 1이면 삭제된 데이터로 간주
            return x.dpc == 0;
        });
        setupTable(filteredData);
    }

    function setupTable(data) {
        if (!data) return;

        const reasonList = data.map((x, idx) => {
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

        setColumns([
            { data: '번호' },
            { data: '반영 내용', className: 'dt-reason' },
            {
                data: (
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
                                    active={x.view == true}
                                    onClick={(e) =>
                                        optionSelect(e, idx, optionList)
                                    }
                                >
                                    {x.data}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                ),
                className: 'dt-content',
                orderBase: 3,
            },
            { hidden: true },
            { data: '#', className: 'dt-button' },
        ]);

        setTableData(reasonList);
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
    }

    /// handle delete
    const handleClickDelete = (x) => {
        const { id } = x;
        MySwal.fire({
            title: '사유 삭제',
            text: `사유를 삭제하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/points/reason/${id}`)
                    .then((res) => {
                        MySwal.fire({
                            title: '삭제 완료',
                            icon: 'success',
                            confirmButtonText: '확인',
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        MySwal.fire({
                            title: '삭제 실패',
                            icon: 'error',
                            confirmButtonText: '확인',
                        });
                    });
            }
        });
    };

    const handleClickEdit = (x) => {
        const { id, title, plus, minus } = x;
        MySwal.fire({
            title: '사유 수정',
            html: (
                <form>
                    <div className="form-group mb-3">
                        <label htmlFor="reasonTitle" className="form-label">
                            사유
                        </label>
                        <Form.Control
                            type="text"
                            id="reasonTitle"
                            placeholder="사유를 입력하세요"
                            defaultValue={title}
                        />
                    </div>
                    <div className="form-group">
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="plus">
                                    <Form.Label>상점</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="상점을 입력하세요"
                                        defaultValue={plus}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
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
                    </div>
                </form>
            ),
            showCancelButton: true,
            confirmButtonText: '수정',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                const reasonTitle =
                    document.getElementById('reasonTitle').value;
                const plus = document.getElementById('plus').value;
                const minus = document.getElementById('minus').value;

                axios
                    .put(`/api/points/reason/${id}`, {
                        id,
                        title: reasonTitle,
                        plus,
                        minus,
                    })
                    .then((res) => {
                        MySwal.fire({
                            title: '수정 완료',
                            icon: 'success',
                            confirmButtonText: '확인',
                        });
                        init();
                    })
                    .catch((err) => {
                        console.log(err);
                        MySwal.fire({
                            title: '수정 실패',
                            icon: 'error',
                            confirmButtonText: '확인',
                        });
                    });
            }
        });
    };

    return (
        <>
            <div id="points_reason">
                <Card>
                    <Card.Header>
                        <Card.Title>사유 관리</Card.Title>
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
