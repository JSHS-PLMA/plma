import { useState, useEffect, useRef } from 'react';

import MySwal from '~shared/ui/sweetalert';
import DataTable from '~shared/ui/datatable';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

import './index.scss';

import { getData, putData } from '~shared/scripts/requestData';

function PLMA_Accounts() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const inputsRef = useRef({});

    useEffect(() => {
        async function init() {
            try {
                const users = await getData('/api/points/view');

                const dataList = users.map((x) => {
                    const { id, stuid, grade, num, name } = x;
                    const className = x.class;

                    return [
                        id,
                        stuid,
                        name,
                        grade,
                        className,
                        num,
                        <>
                            <Button
                                className="rowButton"
                                variant="primary"
                                size="sm"
                                onClick={() => handleClickEdit(x)}
                            >
                                편집
                            </Button>
                            <Button
                                className="rowButton"
                                variant="danger"
                                size="sm"
                            >
                                삭제
                            </Button>
                        </>,
                    ];
                });

                setTableData(dataList);
                setColumns([
                    { data: 'ID' },
                    { data: '학번' },
                    { data: '성명' },
                    { data: '학년' },
                    { data: '반' },
                    { data: '번호' },
                    { data: '#', orderable: false },
                ]);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    /// handleClickEdit 함수 작성, 내부 상태는 ref로 관리, 수정할 수 있는 swal2 모달 띄우기, html은 react로 작성하고 react-bootstrap의 컴포넌트 활용(form, control 등등), 수정 후 확인 버튼 누르면 수정 요청 보내기
    const handleClickEdit = async (x) => {
        const { id, grade, num, name, class: classNum } = x; //stuid

        const handleChange = (e) => {
            const name = e.target.name;
            const value = e.target.value;
            inputsRef.current = {
                ...inputsRef.current,
                [name]: value,
            };
        };

        const res = await MySwal.fire({
            title: '계정 정보 수정',
            html: (
                <Form className="editForm">
                    <Row>
                        <Col>
                            <Form.Group controlId="name">
                                <Form.Label>성명</Form.Label>
                                <Form.Control
                                    name="name"
                                    defaultValue={name}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group controlId="grade">
                                <Form.Label>학년</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="3"
                                    name="grade"
                                    defaultValue={grade}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="class">
                                <Form.Label>반</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="4"
                                    name="class"
                                    defaultValue={classNum}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="num">
                                <Form.Label>번호</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="22"
                                    name="num"
                                    defaultValue={num}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            ),
            showCancelButton: true,
            confirmButtonText: '수정',
        });
        if (res.isConfirmed) {
            try {
                await putData(`/api/points/users/${id}`, inputsRef.current); // 미구현
                MySwal.fire({
                    icon: 'success',
                    title: '수정 성공',
                    text: '계정 정보가 성공적으로 수정되었습니다.',
                });
            } catch (error) {
                console.error(error);
                MySwal.fire({
                    icon: 'error',
                    title: '수정 실패',
                    text: '계정 정보 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                });
            }
        }
    };

    return (
        <>
            <div id="plma_accounts">
                <Card>
                    <Card.Header>
                        <Card.Title>전체 계정 관리</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="tableWrap">
                            <Card.Text className="label">
                                전체 계정 목록
                            </Card.Text>
                            <DataTable
                                className="pointsApplyTable"
                                data={tableData}
                                columns={columns}
                                order={[1, 'asc']}
                                options={{
                                    language: {
                                        search: '통합검색:',
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

export default PLMA_Accounts;
