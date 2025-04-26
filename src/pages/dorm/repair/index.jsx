import { useState, useEffect } from 'react';
import './index.scss';
import { Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import moment from 'moment';
import { getData, putData, deleteData } from '~shared/scripts/requestData';

import DataTable from '~shared/ui/datatable';
import MySwal from '~shared/ui/sweetalert';

function MyDorm_Repair() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        async function init() {
            try {
                await fetchReports();
                setColumns([
                    { data: 'ID' },
                    { data: '호실' },
                    { data: '신청 날짜' },
                    { data: '신청자' },
                    { data: '상세 내용' },
                    { data: '상태' },
                    { data: '사진' },
                    { data: '', orderable: false },
                ]);
            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, []);

    const fetchReports = async () => {
        const reports = await getData('/api/admin/dorms/reports');
        setupTable(reports);
    };

    const handleClickDelete = async (id) => {
        const res = await MySwal.fire({
            title: '정말로 반려하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
        });

        if (res.isConfirmed) {
            try {
                await deleteData(`/api/dorms/reports/${id}`);
                await fetchReports();
                MySwal.fire(
                    {
                        icon: 'success',
                        title: '반려 성공',
                        text: '수리 신청이 성공적으로 반려되었습니다.',
                    }
                    //반려 사유 모달?
                );
            } catch (error) {
                console.log(error);
                MySwal.fire({
                    icon: 'error',
                    title: '반려 실패',
                    text: '수리 신청 반려 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                });
            }
        }
    };

    const handleSelectStatus = async (id, e) => {
        const status = e.target.name;

        try {
            await putData(`/api/dorms/reports/${id}`, { status });
            await fetchReports();
            MySwal.fire({
                icon: 'success',
                title: '변경 성공',
                text: '신청 상태를 성공적으로 변경했습니다.',
            });
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '변경 실패',
                text: '신청 상태 변경 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
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
                id,
                room_name,
                moment(created_at).format('YYYY-MM-DD'),
                `${user_name} (${user_stuid})`,
                description,
                <DropdownButton
                    key={`dropdown-${id}`}
                    id="dropdown-basic-button"
                    title={
                        status === 'pending'
                            ? '접수 완료'
                            : status === 'in_progress'
                              ? '처리 중'
                              : '처리 완료'
                    }
                    drop={'right'}
                    onSelect={(eventKey, event) =>
                        handleSelectStatus(id, event)
                    }
                >
                    <Dropdown.Item name="pending">접수 완료</Dropdown.Item>
                    <Dropdown.Item name="in_progress">처리 중</Dropdown.Item>
                    <Dropdown.Item name="completed">처리 완료</Dropdown.Item>
                </DropdownButton>,
                <a key={`image-link-${id}`} href={image_url} target="_blank">
                    #
                </a>,
                <Button
                    key={`button-cancel-${id}`}
                    variant="danger"
                    size="sm"
                    onClick={() => handleClickDelete(id)}
                >
                    반려
                </Button>,
            ];
        });

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
