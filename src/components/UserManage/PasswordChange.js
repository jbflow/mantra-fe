
import React, { useContext, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'
import { UserContext } from '../../contexts/UserContext';
import { Auth } from 'aws-amplify';
import PasswordValidator from './PasswordValidator';

export default function PasswordChange({ handleShowPasswordChange, handlePasswordChangedAlert }) {

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [allConditionsMet, setAllConditionsMet] = useState(false)
    const [showError, setShowError] = useState(false);
    const [showAlert, setShowAlert] = useState(false);



    const handleAllConditionsMet = (allMet) => {
        setAllConditionsMet(allMet)
    }
    async function changePassword() {

        setChangingPassword(true);
        const currentUser = await Auth.currentAuthenticatedUser();
        try {
            await Auth.changePassword(currentUser, oldPassword, newPassword);
            handlePasswordChangedAlert(true);
            window.setTimeout(() => {
                handlePasswordChangedAlert(false)
            }, 5000);
        } catch (error) {
            setErrorMessage(error.message);
            setShowError(true);
        }
        setChangingPassword(false);
    }
    return (
        <>
            
            <Form>
                <Form.Group controlId="oldPassword">
                    <Form.Label>Old Password</Form.Label>
                    <Form.Control
                        type="password"
                        onChange={(e) => {
                            setOldPassword(e.target.value);
                        }}
                    />
                </Form.Group>

                <Form.Group controlId="newPassowrd">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                        }}
                    />
                </Form.Group>
                <Form.Group controlId="confirmNewPassowrd">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                        type="password"
                        onChange={(e) => {
                            setNewPassword2(e.target.value);
                        }}
                    />
                </Form.Group>
                {showError ? (
                    <Form.Text className="text-danger">{errorMessage}</Form.Text>
                ) : null}
            </Form>
            <PasswordValidator password={newPassword} confirmPassword={newPassword2} handleAllConditionsMet={handleAllConditionsMet} />
            <div className="d-flex justify-content-start">
                <div className='pr-3'>
                    <Button
                        disabled={!allConditionsMet}
                        variant="primary"
                        onClick={() => {
                            changePassword();
                        }}
                    >

                        {changingPassword ? "Changing" : "Change"}
                    </Button>
                </div>
                <div>
                    <Button
                        variant="dark"
                        onClick={() => { handleShowPasswordChange(false) }}>
                        Cancel
                    </Button>
                </div>
            </div>



        </>

    )
}
