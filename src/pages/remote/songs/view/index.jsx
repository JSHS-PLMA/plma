import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

import { Card, Button } from 'react-bootstrap';
import DataTable from '~shared/ui/datatable';

const TITLE = import.meta.env.VITE_TITLE;

function Songs_View() {
    const navigate = useNavigate();

    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        setTableData([
            [1, '기상송 1', '강재환', '00:00:30', 'play', 0, 'X'],
            [2, '기상송 2', '강재환', '00:01:00', 'play', 0, 'X'],
            [3, '기상송 3', '강재환', '00:01:30', 'play', 0, 'X'],
        ]);
        setColumns([
            { data: '순위' },
            { data: '제목' },
            { data: '신청자' },
            { data: '길이' },
            { data: '재생', orderable: false },
            { data: '투표수' },
            { data: '확정여부' },
        ]);
    }

    return (
        <>
            <div id="songs_view">
                <Card>
                    <Card.Header>
                        <Card.Title>기상송 조회</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text className="label">날짜 조회</Card.Text>
                        <br />
                        <Card.Text className="label">기상송 리스트</Card.Text>
                        <br />

                        <DataTable
                            className="remoteSongsViewTable"
                            columns={columns}
                            data={tableData}
                        />
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

export default Songs_View;
