import React, { useContext, useState } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import PasswordChange from './PasswordChange';
import { UserContext } from '../../contexts/UserContext';
import { BsPencil } from "react-icons/bs";

export default function UserModal({ showAccountModal, handleAccountModalClose }) {
    const { email, paymentData } = useContext(UserContext)
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [showAlert, setShowAlert] = useState(false)

    console.log(paymentData)

    const handlePasswordChangedAlert = (value) => {
        setShowAlert(value)
        handleShowPasswordChange(false)
    }

    const handleShowPasswordChange = (value) => {
        setShowPasswordChange(value)
    }
    return (
        <>
            <Modal
                show={showAccountModal}
                onHide={() => {
                    setShowPasswordChange(false)
                    handleAccountModalClose(false);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Manage Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="row">
                        <p className="col" >Email <a href="">(not verified)</a> ❌ :</p>
                        <div className='col'>
                            <div className="row justify-content-between">
                                <p>{email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <p className="col" >Password:</p>
                        <div className='col'>
                            <div className="row">
                                <p className='mt-2 pr-3'>***********************</p>
                                <div style={{ cursor: "pointer" }}>
                                    <BsPencil onClick={() => { handleShowPasswordChange(true) }} />
                                </div>

                            </div>
                        </div>

                    </div>

                    {showPasswordChange ? <PasswordChange handleShowPasswordChange={handleShowPasswordChange} handlePasswordChangedAlert={handlePasswordChangedAlert} /> : null}
                    {showAlert ? (
                        <Alert variant="success" dismissable={true}>
                            Password successfully changed.
                        </Alert>
                    ) : null}
              
                        <div className="row pt-3">
                            <p className="col"> Payment due: 01/04/2024:</p>
                            <div className="col">
                                <a href={`https://app.gumroad.com/subscriptions/${paymentData?.subscription_id}/manage`} target="_blank" className="row">Manage on gumroad</a>
                            </div>
                        </div>
           
                </Modal.Body>

            </Modal>


        </>
    )
}
