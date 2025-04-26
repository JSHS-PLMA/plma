import { useState, useEffect } from 'react';

import MySwal from '~shared/ui/sweetalert';
import DataTable from '~shared/ui/datatable';
import { Card, Button } from 'react-bootstrap';

import './index.scss';

import { getData } from '~shared/scripts/requestData';

function PLMA_Accounts() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

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
    const handleClickEdit = (x) => {
        const { id, stuid, grade, num, name, class: className } = x;

        MySwal.fire({
            title: '계정 정보 수정',
            html: (
                <form id="editForm">
                    <div className="form-group">
                        <label htmlFor="editStuid">학번</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editStuid"
                            defaultValue={stuid}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editName">성명</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editName"
                            defaultValue={name}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editGrade">학년</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editGrade"
                            defaultValue={grade}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editClass">반</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editClass"
                            defaultValue={className}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editNum">번호</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editNum"
                            defaultValue={num}
                        />
                    </div>
                </form>
            ),
            showCancelButton: true,
            confirmButtonText: '수정',
            preConfirm: () => {
                // const editStuid = document.getElementById('editStuid').value;
                // const editName = document.getElementById('editName').value;
                // const editGrade = document.getElementById('editGrade').value;
                // const editClass = document.getElementById('editClass').value;
                // const editNum = document.getElementById('editNum').value;
                //로직작성
            },
        });
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
