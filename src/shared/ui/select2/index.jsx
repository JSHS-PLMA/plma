import { useState, useEffect, useRef } from 'react';
import Pagination from 'react-bootstrap/Pagination';

import './index.scss';

const Select2 = () => {
    return (
        <>
            <div className="select2">
                <Dropdown>
                    <Dropdown.Toggle
                        variant=""
                        className="border w-100 text-start"
                    ></Dropdown.Toggle>

                    <Dropdown.Menu
                        className="w-100"
                        style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
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
            </div>
        </>
    );
};
