import { useState, useEffect, useRef } from 'react';

import DataTable from '~shared/ui/datatable';

import {
    Card,
    ToggleButtonGroup,
    ToggleButton,
    Row,
    Col,
    Button,
} from 'react-bootstrap';
import { getData, putData } from '~shared/scripts/requestData';

import './index.scss';

const GRADES = [
    { name: '1학년', value: 1 },
    { name: '2학년', value: 2 },
    { name: '3학년', value: 3 },
];

function Dorm_Settings() {
    const [grade, setGrade] = useState(3);
    const [year, setYear] = useState(2025);
    const [semester, setSemester] = useState(1);
    const [dormName, setDormName] = useState('송죽관');

    const [selectedCell, setSelectedCell] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    const dormUsersRef = useRef();
    const usersRef = useRef();
    const [dormUsers, setDormUsers] = useState([]);

    const filteredTableData = tableData.filter(
        (x) =>
            x[2] == grade &&
            x[3] == year &&
            x[4] == semester &&
            x[5] == dormName
    );

    const handleStudentClick = (id) => {
        if (!selectedCell) return;
        if (id == -1) {
            setDormUsers((prev) => {
                const newData = prev.map((item) => ({
                    ...item,
                    users: [...item.users],
                }));
                newData[selectedCell.row].users[selectedCell.col] = 'excluded';
                return newData;
            });
            return;
        }

        const student = usersRef.current.find((student) => student.id == id);
        if (!student) return;
        setDormUsers((prev) => {
            const newData = prev.map((item) => ({
                ...item,
                users: [...item.users],
            }));
            newData[selectedCell.row].users[selectedCell.col] = student;
            return newData;
        });
    };

    useEffect(() => {
        async function init() {
            const dormUsers = await getData('/api/dorms');
            dormUsersRef.current = dormUsers;
            setDormUsers(dormUsers);

            const users = await getData('/api/user');
            usersRef.current = users;

            const dataList = [];

            for (let i = 0; i < dormUsers.length; i++) {
                dataList.push([
                    `${String(dormUsers[i].room_name)}`,
                    dormUsers[i].room_id,
                    dormUsers[i].room_grade,
                    dormUsers[i].year,
                    dormUsers[i].semester,
                    dormUsers[i].dorm_name,
                    dormUsers[i].users[0] ? dormUsers[i].users[0].name : '',
                    dormUsers[i].users[1] ? dormUsers[i].users[1].name : '',
                    dormUsers[i].users[2] ? dormUsers[i].users[2].name : '',
                    dormUsers[i].users[3] ? dormUsers[i].users[3].name : '',
                ]);
            }

            setColumns([
                { data: '호실', className: 'dt-first', orderable: false },
                { data: 'room_id', hidden: true },
                { data: 'grade', hidden: true },
                { data: 'year', hidden: true },
                { data: 'semester', hidden: true },
                { data: 'dorm_name', hidden: true },
                { data: '1반', orderable: false },
                { data: '2반', orderable: false },
                { data: '3반', orderable: false },
                { data: '4반', orderable: false },
            ]);
            setTableData(dataList);
        }

        init();
    }, []);

    const handleCellClick = (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;

        const prevCell = document.querySelector('.selected');
        if (prevCell) prevCell.classList.remove('selected');
        cell.classList.add('selected');

        const rowIndex = dormUsers.findIndex(
            (room) =>
                room.room_name ==
                cell.closest('tr').querySelector('td').innerText
        );
        const colIndex = cell.cellIndex;

        setDormUsers((prev) => {
            const newData = prev.map((item) => ({
                ...item,
                users: [...item.users],
            }));
            newData[rowIndex].users[colIndex - 1] = null;
            return newData;
        });

        setSelectedCell({
            row: rowIndex,
            col: colIndex - 1,
        });
    };

    const handleAssignRandomRooms = () => {
        setDormUsers((prev) => {
            const newData = prev.map((room) => ({
                ...room,
                users: Array.from({ length: 4 }, (_, i) =>
                    room.users[i] ? room.users[i] : null
                ),
            }));

            const availableStudents = usersRef.current.filter(
                (user) =>
                    user.grade === grade &&
                    !newData.some((room) => room.users.includes(user))
            );

            for (let room of newData) {
                if (
                    room.room_grade != grade ||
                    room.year != year ||
                    room.semester != semester
                )
                    continue;
                for (let i = 0; i < room.users.length; i++) {
                    if (room.users[i] === null) {
                        const classIndex = i;
                        const classStudents = availableStudents.filter(
                            (student) => student.class === classIndex + 1
                        );

                        if (classStudents.length > 0) {
                            const randomIndex = Math.floor(
                                Math.random() * classStudents.length
                            );
                            room.users[i] = classStudents.splice(
                                randomIndex,
                                1
                            )[0];
                            availableStudents.splice(
                                availableStudents.indexOf(room.users[i]),
                                1
                            );
                        }
                    }
                }
            }

            return newData;
        });
    };

    const handleSave = async () => {
        const data = dormUsers
            .filter(
                (room) =>
                    room.year == year &&
                    room.semester == semester &&
                    room.dorm_name == dormName
            )
            .map((room) => ({
                room_id: room.room_id,
                year: room.year,
                semester: room.semester,
                users: room.users.map((user) => {
                    if (user == 'excluded') return null;
                    else if (user == null) return null;
                    else return user.id;
                }),
            }));
        console.log(data);

        try {
            const res = await putData('/api/dorms', data);
            console.log(res);
        } catch (error) {
            console.error(error);
        }
        return;
    };

    /// 연/학기/기숙사 바뀔때마다 초기화 (api 요청 X)
    // 기숙사 인원 4명으로 가정
    useEffect(() => {
        if (!dormUsersRef.current) return;
        const newData = dormUsersRef.current.map((room) => {
            return {
                ...room,
                users: Array.from({ length: 4 }, (_, i) => room.users[i]),
            };
        });
        setDormUsers(newData);
    }, [year, semester, dormName]);

    useEffect(() => {
        setSelectedCell(null);
    }, [grade, year, semester, dormName]);

    useEffect(() => {
        setTableData((prev) => {
            const newData = prev.map((row, rowIndex) => {
                const updatedRow = [...row];
                dormUsers[rowIndex].users.forEach((user, colIndex) => {
                    if (user == 'excluded') {
                        updatedRow[colIndex + 6] = <strong>제외</strong>; // Adjusted to match the column index
                    } else if (user == null) {
                        updatedRow[colIndex + 6] = ''; // Adjusted to match the column index
                    } else {
                        updatedRow[colIndex + 6] = user.name; // Adjusted to match the column index
                    }
                });
                return updatedRow;
            });
            return newData;
        });
    }, [dormUsers]);

    return (
        <div id="dorm_settings">
            <Card>
                <Card.Header>
                    <Card.Title>기숙사 관리</Card.Title>
                </Card.Header>
                <Card.Body>
                    {/* <Tabs
                            id="grade-tabs"
                            activeKey={grade}
                            onSelect={(k) => setGrade(k)}
                            className="mb-3"
                        >
                            <Tab eventKey="1" title="1학년"></Tab>
                            <Tab eventKey="2" title="2학년"></Tab>
                            <Tab eventKey="3" title="3학년"></Tab>
                        </Tabs> */}
                    <div className="d-flex flex-row mb-3">
                        <div className="me-3">
                            <Card.Text className="label">연도</Card.Text>
                            <select
                                className="form-select"
                                value={year}
                                onChange={(e) => {
                                    setYear(Number(e.target.value));
                                }}
                            >
                                {Array.from(
                                    { length: new Date().getFullYear() - 2024 },
                                    (_, i) => 2025 + i
                                ).map((yearOption) => (
                                    <option key={yearOption} value={yearOption}>
                                        {yearOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="me-3">
                            <Card.Text className="label">학기</Card.Text>
                            <select
                                className="form-select"
                                value={semester}
                                onChange={(e) => {
                                    setSemester(Number(e.target.value));
                                }}
                            >
                                <option value={1}>1학기</option>
                                <option value={2}>2학기</option>
                            </select>
                        </div>
                        <div>
                            <Card.Text className="label">기숙사</Card.Text>
                            <select
                                className="form-select"
                                value={dormName}
                                onChange={(e) => {
                                    setDormName(e.target.value);
                                }}
                            >
                                <option value="송죽관">송죽관</option>
                                <option value="동백관">동백관</option>
                            </select>
                        </div>
                    </div>

                    <Card.Text className="label">학년 선택</Card.Text>
                    <ToggleButtonGroup
                        type="radio"
                        name="grade-options"
                        value={grade}
                        onChange={(value) => {
                            setGrade(value);
                        }}
                    >
                        {GRADES.map((x, idx) => {
                            return (
                                <ToggleButton
                                    key={idx}
                                    variant={
                                        idx + 1 == { grade }
                                            ? 'dark'
                                            : 'outline-dark'
                                    }
                                    id={`grade-btn-${idx + 1}`}
                                    value={idx + 1}
                                >
                                    {x.name}
                                </ToggleButton>
                            );
                        })}
                    </ToggleButtonGroup>

                    <div className="d-flex flex-row mt-4 align-items-start">
                        <div className="tableWrap">
                            <div className="tableHeader">
                                남은 제외인원
                                <table className="table table-bordered remainingExcludedTable">
                                    <thead>
                                        <tr>
                                            {['1반', '2반', '3반', '4반'].map(
                                                (className, index) => {
                                                    const remainingExcluded =
                                                        usersRef.current
                                                            ? dormUsers.filter(
                                                                  (dorm) =>
                                                                      dorm.room_grade ==
                                                                          grade &&
                                                                      dorm.year ==
                                                                          year &&
                                                                      dorm.semester ==
                                                                          semester &&
                                                                      dorm.dorm_name ==
                                                                          dormName
                                                              ).length -
                                                              usersRef.current.filter(
                                                                  (user) =>
                                                                      user.grade ==
                                                                          grade &&
                                                                      user.class ==
                                                                          index +
                                                                              1 &&
                                                                      ((dormName ===
                                                                          '송죽관' &&
                                                                          user.gender ===
                                                                              'M') ||
                                                                          (dormName ===
                                                                              '동백관' &&
                                                                              user.gender ===
                                                                                  'W'))
                                                              ).length -
                                                              dormUsers.filter(
                                                                  (dorm) =>
                                                                      dorm.room_grade ==
                                                                          grade &&
                                                                      dorm.year ==
                                                                          year &&
                                                                      dorm.semester ==
                                                                          semester &&
                                                                      dorm.dorm_name ==
                                                                          dormName &&
                                                                      dorm
                                                                          .users[
                                                                          index
                                                                      ] ==
                                                                          'excluded'
                                                              ).length
                                                            : null;

                                                    console.log(
                                                        remainingExcluded
                                                    );
                                                    return (
                                                        <th key={index}>
                                                            {className}:{' '}
                                                            <small>
                                                                {
                                                                    remainingExcluded
                                                                }
                                                            </small>
                                                        </th>
                                                    );
                                                }
                                            )}
                                        </tr>
                                    </thead>
                                </table>
                            </div>

                            <DataTable
                                className="dormSettingsTable"
                                columns={columns}
                                data={filteredTableData}
                                order={[0, 'asc']}
                                options={{
                                    pagination: false,
                                    search: false,
                                }}
                                onClick={handleCellClick}
                            ></DataTable>
                        </div>

                        <div className="studentsGrid">
                            {(() => {
                                const rows = [];
                                const perRow = 5;

                                if (selectedCell == null) {
                                    return <div>셀을 선택해주세요</div>;
                                }
                                const students = usersRef.current
                                    ? usersRef.current.filter(
                                          (user) =>
                                              user.grade == grade &&
                                              user.class ==
                                                  selectedCell.col + 1 &&
                                              ((dormName === '송죽관' &&
                                                  user.gender === 'M') ||
                                                  (dormName === '동백관' &&
                                                      user.gender === 'W')) &&
                                              !dormUsers.some((dorm) =>
                                                  dorm.users.includes(user)
                                              )
                                      )
                                    : [];

                                students.unshift({
                                    id: -1,
                                    name: <strong>제외</strong>,
                                    stuid: '',
                                });

                                for (
                                    let i = 0;
                                    i < students.length;
                                    i += perRow
                                ) {
                                    const rowItems = students.slice(
                                        i,
                                        i + perRow
                                    );
                                    rows.push(
                                        <Row
                                            key={'row_' + i}
                                            className="mb-2"
                                            xs={5}
                                        >
                                            {rowItems.map((student) => (
                                                <Col
                                                    key={student.id}
                                                    onClick={() =>
                                                        handleStudentClick(
                                                            student.id
                                                        )
                                                    }
                                                >
                                                    <Button variant={'light'}>
                                                        {student.stuid}{' '}
                                                        {student.name}
                                                    </Button>
                                                </Col>
                                            ))}
                                        </Row>
                                    );
                                }

                                return rows;
                            })()}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={handleSave}
                        >
                            저장
                        </Button>
                        <Button
                            variant="danger"
                            className="me-2"
                            onClick={() => {
                                const newData = dormUsersRef.current.map(
                                    (room) => {
                                        return {
                                            ...room,
                                            users: Array.from(
                                                { length: 4 },
                                                (_, i) => room.users[i]
                                            ),
                                        };
                                    }
                                );
                                setDormUsers(newData);
                            }}
                        >
                            초기화
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleAssignRandomRooms}
                        >
                            무작위 방배정
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Dorm_Settings;
