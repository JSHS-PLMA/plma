import { useState, useEffect, useRef } from 'react';
import './index.scss';
import { Card, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import moment from 'moment';
import * as request from '~shared/scripts/requestData';

import DataTable from '~shared/ui/datatable';
import MySwal from '~shared/ui/sweetalert';

function MyDorm_Repair() {
    const dataRef = useRef([]);

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        // Call api to fetch user info by axios
        // axios.get('/api/userInfo').then((res) => {
        //     setUserInfo(res.data);
        // });
        async function init() {
            const data = await request.getData('/api/admin/dorms/reports');
            // const data = [];
            dataRef.current = data;
            setupTable(data);
        }

        init();
    }, []);

    const handleClickDelete = async (id) => {
        const result = await MySwal.fire({
            title: '취소',
            text: '정말로 취소하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
        });

        if (result.isConfirmed) {
            await request.deleteData(`/api/dorms/reports/${id}`);
            await MySwal.fire('취소 완료', '신청이 취소되었습니다.', 'success');
            await init();
        }
    };

    const handleSelectStatus = async (id, e) => {
        const status = e.target.name;
        console.log(id, status);

        await request.putData(`/api/dorms/reports/${id}`, { status });
        await MySwal.fire('상태 변경', '상태가 변경되었습니다.', 'success');
        await init();
    };

    function setupTable(data) {
        if (!data) return;

        const dataList = data.map((x) => {
            const {
                id,
                created_at,
                room_name,
                user_name,
                user_stuid,
                description,
                status,
                image_url,
            } = x;
            return [
                // <Form.Check type="checkbox" key={image_url}>
                //     <Form.Check.Input type="checkbox" isValid />
                // </Form.Check>,
                id,
                room_name,
                moment(created_at).format('YYYY-MM-DD'),
                `${user_name} (${user_stuid})`,
                description,
                /// status: pending, in_progress, completed
                <DropdownButton
                    id="dropdown-basic-button"
                    title={
                        status === 'pending'
                            ? '대기 중'
                            : status === 'in_progress'
                              ? '처리 중'
                              : '처리 완료'
                    }
                    key={`dropdown-${id}`}
                    drop={'right'}
                    onSelect={(eventKey, event) =>
                        handleSelectStatus(id, event)
                    }
                >
                    <Dropdown.Item name="pending">대기 중</Dropdown.Item>
                    <Dropdown.Item name="in_progress">처리 중</Dropdown.Item>
                    <Dropdown.Item name="completed">처리 완료</Dropdown.Item>
                </DropdownButton>,
                <a href={image_url} key={image_url} target="_blank">
                    #
                </a>,
                <Button
                    variant="danger"
                    size="sm"
                    key={`cancel-${image_url}`}
                    onClick={() => handleClickDelete(id)}
                >
                    반려
                </Button>,
            ];
        });

        setColumns([
            /// 수리 신청 내역 조회 테이블 컬럼 (형식: {data: '', ...})
            // { data: '선택', orderable: false },
            { data: 'ID' },
            { data: '방' },
            { data: '신청 날짜' },
            { data: '신청자' },
            { data: '상세 내용' },
            { data: '상태' },
            { data: '사진' },
            { data: '', orderable: false },
        ]);
        setTableData(dataList);
    }
    return (
        <>
            <div className="myDorm-repair">
                <Card>
                    <Card.Header>
                        <Card.Title>기숙사 수리 신청 관리</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <p>수리 신청 내역 조회</p>
                        <DataTable
                            columns={columns}
                            data={tableData}
                            order={[1, 'desc']}
                        />
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default MyDorm_Repair;
