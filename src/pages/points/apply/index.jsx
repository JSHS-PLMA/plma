import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';
import MySwal from '~shared/ui/sweetalert';

import {
    Card,
    Button,
    Form,
    InputGroup,
    Row,
    Col,
    Dropdown,
} from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

import { getData, postData } from '~shared/scripts/requestData';

function Points_Apply() {
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [users, setUsers] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [userSearchKeyword, setUserSearchKeyword] = useState('');
    const [reasonSearchKeyword, setReasonSearchKeyword] = useState('');
    const [inputs, setInputs] = useState({
        grade: 9,
        classNum: 9,
        studentNum: 81,
        reason: 1,
        reasonCaption: '상점봉사활동신청서1',
        plusPoints: 0,
        minusPoints: 0,
        act_date: new Date().toISOString().split('T')[0], // 오늘 날짜로 초기화
    });

    const name =
        users.find(
            (user) =>
                user.grade == inputs.grade &&
                user.class == inputs.classNum &&
                user.num == inputs.studentNum
        )?.name || '';

    // const reasonCaption =
    //     reasons.length > 0
    //         ? reasons.find((reason) => reason.id === inputs.reason).title
    //         : '';

    const handleSearch = (e) => {
        if (e.target.name == 'user') setUserSearchKeyword(e.target.value);
        else if (e.target.name == 'reason')
            setReasonSearchKeyword(e.target.value);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(userSearchKeyword) ||
            user.stuid.toString().includes(userSearchKeyword)
    );

    const filteredReasons = reasons.filter((reason) =>
        reason.title.toLowerCase().includes(reasonSearchKeyword)
    );

    const handleChange = (e) => {
        const { name, value } = e.target; // name 속성 가져오기

        setInputs((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleApplyRecord = async () => {
        if (tableData.length == 0) {
            MySwal.fire({
                icon: 'warning',
                title: '경고',
                text: '상벌점을 부여할 학생을 선택해주세요.',
            });
            return;
        }
        const entries = tableData.map((entry) => {
            const [
                ,
                // ID
                act_date,
                grade,
                classNum,
                studentNum, // name (stuid)
                ,
                plusPoints,
                minusPoints, // updatedTotalPoints
                ,
                reason,
                reasonCaption,
            ] = entry;

            return {
                act_date,
                grade,
                classNum,
                num: studentNum,
                plusPoints: parseInt(plusPoints),
                minusPoints: parseInt(minusPoints),
                reason,
                reasonCaption,
            };
        });

        console.log(entries);
        // API 호출
        try {
            await postData('/api/points', entries);

            await MySwal.fire({
                icon: 'success',
                title: '성공',
                text: '상벌점이 성공적으로 부여되었습니다.',
            });

            init();
        } catch (err) {
            console.error(err);
            await MySwal.fire({
                icon: 'error',
                title: '실패',
                text: '상벌점 부여에 실패했습니다.',
            });
        }
    };

    const handleAddRecord = () => {
        if (inputs.plusPoints == 0 && inputs.minusPoints == 0) {
            alert('상점이나 벌점을 입력해주세요.');
            return;
        }
        const selectedUser = users.find(
            (user) =>
                user.grade === inputs.grade &&
                user.class === inputs.classNum &&
                user.num === inputs.studentNum
        );

        if (!selectedUser) {
            alert('선택된 학생 정보를 찾을 수 없습니다.');
            return;
        }

        const updatedTotalPoints =
            selectedUser.plus -
            selectedUser.minus +
            parseInt(inputs.plusPoints) -
            parseInt(inputs.minusPoints);

        const newEntry = [
            tableData.length,
            inputs.act_date,
            inputs.grade,
            inputs.classNum,
            inputs.studentNum,
            `${name} (${inputs.grade}${inputs.classNum}${inputs.studentNum.toString().padStart(2, '0')})`,
            inputs.plusPoints,
            inputs.minusPoints,
            updatedTotalPoints,
            inputs.reason,
            inputs.reasonCaption,
        ];

        const newTableData = [...tableData, newEntry];

        setTableData(newTableData);
    };

    const handleSelectUser = (e) => {
        const name = e.target.getAttribute('name');
        const value = e.target.getAttribute('value');

        const grade = Math.floor(value / 1000);
        const classNum = Math.floor((value % 1000) / 100);
        const studentNum = value % 100;

        setInputs((prev) => ({
            ...prev,
            grade,
            classNum,
            studentNum,
            name,
        }));
    };

    const handleSelectReason = (e) => {
        const value = e.target.getAttribute('value');

        setInputs((prev) => ({
            ...prev,
            reason: parseInt(value),
            reasonCaption: reasons.find((reason) => reason.id == value).title,
            plusPoints: reasons.find((reason) => reason.id == value).plus,
            minusPoints: reasons.find((reason) => reason.id == value).minus,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 방지
    };

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const users = await getData('/api/user');
        const reasons = await getData('/api/reason');
        setUsers(users);
        setReasons(reasons);

        setTableData([]);
        setColumns([
            { data: 'ID' },
            { data: '일자' },
            { data: '학년' },
            { data: '반' },
            { data: '번호' },
            { data: '성명 (학번)' },
            { data: '발급할 상점' },
            { data: '발급할 벌점' },
            { data: '처리 후 합계' },
            { data: '사유코드' },
            { data: '사유' },
        ]);
    }

    return (
        <>
            <div id="points_apply">
                <Card>
                    <Card.Header>
                        <Card.Title>상벌점 부여</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">학생 정보 입력</Card.Text>

                        <Form onSubmit={handleSubmit}>
                            <Dropdown className="mb-3">
                                <Dropdown.Toggle
                                    variant=""
                                    className="border w-100 text-start"
                                >
                                    {name} ({inputs.grade}
                                    {inputs.classNum}
                                    {inputs.studentNum
                                        .toString()
                                        .padStart(2, '0')}
                                    )
                                </Dropdown.Toggle>

                                <Dropdown.Menu
                                    className="w-100"
                                    style={{
                                        maxHeight: '500px',
                                        overflowY: 'scroll',
                                        padding: 0,
                                    }}
                                >
                                    {/* 옵션 목록 */}
                                    <Form.Control
                                        type="text"
                                        name="user"
                                        onChange={handleSearch}
                                        style={{
                                            position: 'sticky',
                                            top: '0px',
                                            backgroundColor: 'white',
                                            borderBottom: '1px solid #ddd',
                                            zIndex: '10',
                                            outline: 'none',
                                            boxShadow: 'none',
                                        }}
                                    />

                                    {filteredUsers.map((user) => (
                                        <Dropdown.Item
                                            key={user.stuid}
                                            name={user.name}
                                            value={user.stuid}
                                            onClick={handleSelectUser}
                                        >
                                            {user.name} ({user.stuid})
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* 학년 입력 */}
                            <Row className="g-2 mb-3">
                                <Col md>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light text-dark">
                                            학년
                                        </InputGroup.Text>{' '}
                                        {/* 옅은 회색 배경으로 수정 */}
                                        <Form.Control
                                            type="number"
                                            name="grade"
                                            value={inputs.grade}
                                            onChange={handleChange}
                                            placeholder="학년"
                                            min="1"
                                            max="3"
                                        />
                                    </InputGroup>
                                </Col>

                                {/* 반 입력 */}
                                <Col md>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light text-dark">
                                            반
                                        </InputGroup.Text>{' '}
                                        {/* 옅은 회색 배경으로 수정 */}
                                        <Form.Control
                                            type="number"
                                            name="classNum"
                                            value={inputs.classNum}
                                            onChange={handleChange}
                                            placeholder="반"
                                            min="1"
                                            max="4"
                                        />
                                    </InputGroup>
                                </Col>

                                {/* 번호 입력 */}
                                <Col md>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light text-dark">
                                            번호
                                        </InputGroup.Text>{' '}
                                        <Form.Control
                                            type="number"
                                            name="studentNum"
                                            value={inputs.studentNum}
                                            onChange={handleChange}
                                            placeholder="번호"
                                            min="1"
                                            max="21"
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Form>

                        <Card.Text className="label">발급 내용 입력</Card.Text>
                        <Row className="g-2 mb-3">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light text-dark">
                                        기준 규정
                                    </InputGroup.Text>

                                    <Dropdown>
                                        <Dropdown.Toggle
                                            variant=""
                                            className="flex-grow-1 text-start border"
                                        >
                                            {reasons.find(
                                                (reason) =>
                                                    reason.id == inputs.reason
                                            )?.title || '사유 선택'}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu
                                            style={{
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                padding: 0,
                                            }}
                                        >
                                            {/* 옵션 목록 */}
                                            <Form.Control
                                                type="text"
                                                name="reason"
                                                onChange={handleSearch}
                                                style={{
                                                    position: 'sticky',
                                                    top: '0px',
                                                    backgroundColor: 'white',
                                                    borderBottom:
                                                        '1px solid #ddd',
                                                    zIndex: '10',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                }}
                                            />

                                            {filteredReasons.map(
                                                (reason, idx) => (
                                                    <Dropdown.Item
                                                        key={idx}
                                                        value={reason.id}
                                                        onClick={
                                                            handleSelectReason
                                                        }
                                                    >
                                                        {reason.title}
                                                    </Dropdown.Item>
                                                )
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </InputGroup>
                            </Col>

                            {/* 상점 입력 */}
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light text-dark">
                                        상점
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="plusPoints"
                                        value={inputs.plusPoints}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </InputGroup>
                            </Col>

                            {/* 벌점 입력 */}
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light text-dark">
                                        벌점
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        name="minusPoints"
                                        value={inputs.minusPoints}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                        <Card.Text className="label">임의 표시 정보</Card.Text>
                        <Row className="g-2">
                            {/* 기준 일자 */}
                            <Col md={4}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light text-dark">
                                        기준 일자
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        name="act_date"
                                        value={inputs.act_date}
                                        onChange={handleChange}
                                    />
                                </InputGroup>
                            </Col>

                            {/* 부여 사유 */}
                            <Col md={8}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light text-dark">
                                        부여 사유
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="reasonCaption"
                                        value={inputs.reasonCaption}
                                        onChange={handleChange}
                                        placeholder=""
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        <Button
                            className="mt-3"
                            variant="primary"
                            type="button"
                            onClick={handleAddRecord}
                        >
                            추가
                        </Button>
                        <div className="tableWrap">
                            <br />
                            <Card.Text className="label">
                                발급할 상벌점 목록 ({tableData.length})
                            </Card.Text>
                            <DataTable
                                className="pointsApplyTable"
                                data={tableData}
                                columns={columns}
                                options={{
                                    search: false,
                                }}
                                order={[0, 'desc']}
                            />
                        </div>

                        {/* 마지막 행 삭제 버튼 */}
                        <Button
                            className="mt-3 me-2"
                            variant="danger"
                            type="button"
                            onClick={() => {
                                if (tableData.length == 0) return;

                                setTableData((prev) => {
                                    const newTableData = [...prev];
                                    newTableData.pop();
                                    return newTableData;
                                });
                            }}
                            disabled={tableData.length == 0}
                        >
                            마지막 행 삭제
                        </Button>

                        {/* 적용 버튼 */}
                        <Button
                            className="mt-3"
                            variant="primary"
                            type="button"
                            onClick={handleApplyRecord}
                            disabled={tableData.length == 0}
                        >
                            적용
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Points_Apply;
