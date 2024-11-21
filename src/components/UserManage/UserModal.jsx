import React, { useContext, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PasswordChange from './PasswordChange';
import { UserContext } from '../../contexts/UserContext';

export default function UserModal({ showAccountModal, handleAccountModalClose }) {
    const { user } = useContext(UserContext);
    const email = user?.email;
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    const handleShowPasswordChange = (value) => {
        setShowPasswordChange(value);
    };

    return (
        <>
            <Modal
                show={showAccountModal}
                onHide={() => {
                    setShowPasswordChange(false);
                    handleAccountModalClose(false);
                }}
            >
                <Modal.Header>
                    <Modal.Title>Manage Account</Modal.Title>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => {
                            setShowPasswordChange(false);
                            handleAccountModalClose(false);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            position: 'absolute',
                            top: '0.5rem',
                            right: '1rem',
                        }}
                    >
                        ×
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3" style={{ padding: '10px 15px' }}>
                        <p style={{ margin: 0, padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                            <strong>Email:</strong> {email}
                        </p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Button
                            variant="primary"
                            onClick={() => handleShowPasswordChange(!showPasswordChange)}
                        >
                            Change Password
                        </Button>

                        <Button
                            variant="secondary"
                            href={`https://app.gumroad.com/subscriptions/${user?.subscription_id}/manage`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Manage Subscription
                        </Button>
                    </div>

                    {showPasswordChange && (
                        <PasswordChange
                            handleShowPasswordChange={handleShowPasswordChange}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}
