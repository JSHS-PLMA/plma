import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import DataTable from '~shared/ui/datatable';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';

import './index.scss';

import MySwal from '~shared/ui/sweetalert';

import { getData, putData } from '~shared/scripts/requestData';

//
PermissionManager.propTypes = {
    accessible: PropTypes.array.isRequired,
    inaccessible: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
};
//

function PermissionManager({ accessible, inaccessible, handleChange }) {
    const [accessiblePermissions, setAccessiblePermissions] =
        useState(accessible);
    const [inaccessiblePermissions, setInaccessiblePermissions] =
        useState(inaccessible);
    const [filterAccess, setFilterAccess] = useState('');
    const [filterInaccess, setFilterInaccess] = useState('');
    useEffect(() => {
        handleChange({
            accessiblePermissions,
            inaccessiblePermissions,
        });
    }, [accessiblePermissions, inaccessiblePermissions, handleChange]);

    const handleMoveToAccessible = (permission) => {
        setInaccessiblePermissions((prev) =>
            prev.filter((p) => p.id !== permission.id)
        );
        setAccessiblePermissions((prev) => [...prev, permission]);
    };

    const handleMoveToInaccessible = (permission) => {
        setAccessiblePermissions((prev) =>
            prev.filter((p) => p.id !== permission.id)
        );
        setInaccessiblePermissions((prev) => [...prev, permission]);
    };

    const moveAllToAccessible = () => {
        setAccessiblePermissions([
            ...accessiblePermissions,
            ...inaccessiblePermissions,
        ]);
        setInaccessiblePermissions([]);
    };

    const moveAllToInaccessible = () => {
        setInaccessiblePermissions([
            ...inaccessiblePermissions,
            ...accessiblePermissions,
        ]);
        setAccessiblePermissions([]);
    };

    const filteredAccess = accessiblePermissions?.filter(({ name }) =>
        name.toLowerCase().includes(filterAccess.toLowerCase())
    );
    const filteredInaccess = inaccessiblePermissions?.filter(({ name }) =>
        name.toLowerCase().includes(filterInaccess.toLowerCase())
    );

    return (
        <>
            <div className="container">
                {/* Inaccessible */}
                <div className="permissionWrap">
                    <label>접근 불가</label>
                    <input
                        type="text"
                        placeholder="Filter"
                        value={filterInaccess}
                        onChange={(e) => setFilterInaccess(e.target.value)}
                    />
                    <div className="permissionList">
                        {filteredInaccess.map(({ id, name }) => (
                            <div
                                key={name}
                                onClick={() =>
                                    handleMoveToAccessible({ id, name })
                                }
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="buttonWrap">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={moveAllToAccessible}
                    >
                        {'>'}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={moveAllToInaccessible}
                    >
                        {'<'}
                    </Button>
                </div>

                {/* Accessible */}
                <div className="permissionWrap">
                    <label>접근 가능</label>
                    <input
                        type="text"
                        placeholder="Filter"
                        value={filterAccess}
                        onChange={(e) => setFilterAccess(e.target.value)}
                    />
                    <div className="permissionList">
                        {filteredAccess.map(({ id, name }) => (
                            <div
                                key={name}
                                onClick={() =>
                                    handleMoveToInaccessible({ id, name })
                                }
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function IAM_Accounts() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const inputsRef = useRef();

    const handleClickEditPermission = async (userId) => {
        try {
            const user = await getData(`/api/iam/users/${userId}/permissions`);
            console.log(user);

            if (!user) {
                console.error('User not found in permissions data');
                return;
            }

            const res = await MySwal.fire({
                title: 'IAM 권한 수정',
                width: 800,
                html: (
                    <PermissionManager
                        accessible={user.accessiblePermissions}
                        inaccessible={user.inaccessiblePermissions}
                        handleChange={(data) => {
                            inputsRef.current = data;
                        }}
                    />
                ),
                icon: 'question',
                confirmButtonText: '저장',
                showCancelButton: true,
                cancelButtonText: '취소',
            });
            console.log(inputsRef.current);

            if (res.isConfirmed) {
                await putData(
                    `/api/iam/users/${userId}/permissons`,
                    inputsRef.current
                );
                MySwal.fire({
                    icon: 'success',
                    title: '권한 수정 성공',
                    text: '권한이 성공적으로 수정되었습니다',
                });
            }
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '권한 수정 실패',
                text: '권한 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
    };

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
                await putData(`/api/iam/users/${id}`, inputsRef.current); // 미구현
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

    useEffect(() => {
        async function init() {
            try {
                const users = await getData('/api/iam');
                console.log(users);

                const dataList = users.map((user) => {
                    const {
                        id,
                        stuid,
                        name,
                        class: className,
                        grade,
                        num,
                    } = user;
                    // const className = user.class;

                    return [
                        id,
                        stuid,
                        name,
                        grade,
                        className,
                        num,
                        'PLMA, CLUBS',
                        <>
                            <Button
                                className="rowButton"
                                variant="primary"
                                size="sm"
                                onClick={() => handleClickEdit(user)}
                            >
                                편집
                            </Button>
                            <Button
                                className="rowButton"
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                    handleClickEditPermission(user.id)
                                }
                            >
                                권한수정
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
                    { data: '연결된 서비스' },
                    { data: '#', orderable: false },
                ]);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    return (
        <>
            <div id="iam_accounts">
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

export default IAM_Accounts;
