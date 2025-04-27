import { useState, useEffect } from 'react';
import './index.scss';
import { Card, Form, Button } from 'react-bootstrap';
import moment from 'moment';
import { getData, deleteData, postData } from '~shared/scripts/requestData';

import MySwal from '~shared/ui/sweetalert';
import DataTable from '~shared/ui/datatable';

function MyDorm_Repair() {
    const [user, setUser] = useState({
        id: 0,
        name: '',
        stuid: '',
        room_id: '',
    });

    const [description, setDescription] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    async function fetchReports() {
        const reports = await getData('/api/dorms/reports');
        setupTable(reports);
    }

    function clearInput() {
        setDescription('');
        setUploadedImage(null);
    }

    useEffect(() => {
        async function init() {
            try {
                setUser({
                    id: 32020,
                    name: '강재환',
                    stuid: '9988',
                    room_id: '501',
                });
                await fetchReports();
                setColumns([
                    { data: 'ID' },
                    { data: '방' },
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

    const handleClickDelete = async (id) => {
        try {
            const res = await MySwal.fire({
                title: '정말로 취소하시겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
            });

            if (res.isConfirmed) {
                await deleteData(`/api/dorms/reports/${id}`);
                await fetchReports();

                MySwal.fire({
                    icon: 'success',
                    title: '취소 성공',
                    text: '수리 신청이 성공적으로 취소되었습니다.',
                });
            }
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '취소 실패',
                text: '수리 신청 취소 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
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
                // <Form.Check type="checkbox" key={image_url}>
                //     <Form.Check.Input type="checkbox" isValid />
                // </Form.Check>,
                id,
                room_name,
                moment(created_at).format('YYYY-MM-DD'),
                `${user_name} (${user_stuid})`,
                description,
                /// status: pending, in_progress, completed
                status === 'pending' ? (
                    <span className="text">접수 완료</span>
                ) : status === 'in_progress' ? (
                    <span className="text-primary">처리 중</span>
                ) : (
                    <span className="text-success">완료</span>
                ),

                <a key={`image-link-${id}`} href={image_url} target="_blank">
                    #
                </a>,
                <Button
                    variant="danger"
                    size="sm"
                    key={`button-cancel-${id}`}
                    onClick={() => handleClickDelete(id)}
                >
                    취소
                </Button>,
            ];
        });

        setTableData(dataList);
    }

    const handleChange = (e) => {
        setDescription(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('id', user.id); // 사용자 id 추가
        formData.append('description', description); // 설명 추가
        formData.append('image', uploadedImage); // 이미지 파일 추가

        try {
            await postData('/api/dorms/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await fetchReports();
            clearInput();
            MySwal.fire({
                icon: 'success',
                title: '신청 성공',
                text: '수리 신청이 성공적으로 접수되었습니다.',
            });
        } catch (error) {
            console.error(error);
            MySwal.fire({
                icon: 'error',
                title: '신청 실패',
                text: '수리 신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedImage(file);
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
    };

    return (
        <>
            <div className="myDorm-repair">
                <Card>
                    <Card.Header>
                        <Card.Title>기숙사 시설 수리 신청</Card.Title>
                    </Card.Header>

                    <Card.Body>
                        <div className="user-info">
                            <p>
                                <strong>이름:</strong> {user.name}
                            </p>
                            <p>
                                <strong>학번:</strong> {user.stuid}
                            </p>
                            <p>
                                <strong>방 번호:</strong> {user.room_id}
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formIssue">
                                <Form.Label>문제 설명</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={description}
                                    onChange={handleChange}
                                    placeholder="수리가 필요한 부분을 설명해주세요"
                                    rows={3}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formFile">
                                <Form.Label>사진 업로드(필수)</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    value={
                                        uploadedImage
                                            ? `C:\\fakepath\\${uploadedImage.name}`
                                            : ''
                                    }
                                    required
                                />
                                {uploadedImage && (
                                    <div className="uploaded-image-preview">
                                        <p>{uploadedImage.name}</p>
                                        <Button
                                            variant="danger"
                                            onClick={handleRemoveImage}
                                        >
                                            삭제
                                        </Button>
                                    </div>
                                )}
                            </Form.Group>

                            <Button type="submit" variant="primary">
                                제출
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header>
                        <Card.Title>수리 신청 내역 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
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
