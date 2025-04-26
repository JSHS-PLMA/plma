import { useState, useEffect, useRef } from 'react';
import './index.scss';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { getData } from '~shared/scripts/requestData';

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
    const dataRef = useRef([]);

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        // Call api to fetch user info by axios
        // axios.get('/api/userInfo').then((res) => {
        //     setUserInfo(res.data);
        // });
        async function init() {
            const data = await getData('/api/dorms/reports');
            dataRef.current = data;
            setupTable(data);
        }

        init();
        setUser({
            id: 32020,
            name: '강재환',
            stuid: '9988',
            room_id: '501',
        });
    }, []);

    const handleClickDelete = async (id) => {
        try {
            const result = await MySwal.fire({
                title: '취소',
                text: '정말로 취소하시겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
            });

            if (result.isConfirmed) {
                await axios.delete(`/api/dorms/reports/${id}`);

                await MySwal.fire(
                    '취소 완료',
                    '신청이 취소되었습니다.',
                    'success'
                );
            }
        } catch (error) {
            console.error(error);
            await MySwal.fire(
                '오류 발생',
                '신청 취소 중 문제가 발생했습니다.',
                'error'
            );
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
                    <span className="text">대기 중</span>
                ) : status === 'in_progress' ? (
                    <span className="text-primary">처리 중</span>
                ) : (
                    <span className="text-success">완료</span>
                ),

                <a href={image_url} key={image_url} target="_blank">
                    #
                </a>,
                /// 취소 버튼
                <Button
                    variant="danger"
                    size="sm"
                    key={`cancel-${image_url}`}
                    onClick={() => handleClickDelete(id)}
                >
                    취소
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

    const handleChange = (e) => {
        setDescription(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Repair Request Submitted:', { ...user, description });

        const formData = new FormData();
        formData.append('id', user.id); // 사용자 id 추가
        formData.append('description', description); // 설명 추가
        formData.append('image', uploadedImage); // 이미지 파일 추가
        //Call api to submit repair request by axios
        try {
            const res = await axios.post('/api/dorms/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(res);

            await MySwal.fire({
                title: '신고 완료',
                text: '신고가 접수되었습니다.',
                icon: 'success',
            });
        } catch (err) {
            console.error(err);

            await MySwal.fire({
                title: '신고 실패',
                text: '신고 접수에 실패했습니다.',
                icon: 'error',
            });
        }
    };

    const [uploadedImage, setUploadedImage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedImage(file);
        console.log(file);
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
