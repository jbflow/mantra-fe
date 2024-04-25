import React, { useEffect, useState } from "react";

function PasswordValidator({ password, confirmPassword, handleAllConditionsMet }) {
    const [errors, setErrors] = useState({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });


    useEffect(() => {
        validatePassword(password)
    }, [password, confirmPassword])


    useEffect(() => {
        const allMet = Object.values(errors).every(val => val);
        handleAllConditionsMet(allMet);
    }, [errors]);

    const validatePassword = (value) => {

        const errorsCopy = { ...errors };

        // Minimum length requirement
        errorsCopy.minLength = value.length >= 8;

        // Regex patterns for uppercase, lowercase, number, and special character
        const patterns = [
            /[A-Z]/, // Uppercase
            /[a-z]/, // Lowercase
            /[0-9]/, // Number
            /[^A-Za-z0-9]/ // Special character
        ];

        // Check if password meets all requirements
        patterns.forEach((pattern, index) => {
            errorsCopy[Object.keys(errorsCopy)[index + 1]] = pattern.test(value);
        });

        errorsCopy.match = confirmPassword === value && Object.values(errorsCopy).slice(0, -1).every(Boolean);
        setErrors(errorsCopy);
    };

    return (
        <div>
            <ul style={{ padding: "5px", listStyleType: 'none' }}>
                <li> {errors.minLength ? '✅' : '❌'} Password must be at least 8 characters long: </li>
                <li> {errors.uppercase ? '✅' : '❌'} Password must contain at least one uppercase letter </li>
                <li>{errors.lowercase ? '✅' : '❌'} Password must contain at least one lowercase letter </li>
                <li>{errors.number ? '✅' : '❌'} Password must contain at least one number</li>
                <li>{errors.specialChar ? '✅' : '❌'} Password must contain at least one special character </li>
                <li>{errors.match ? '✅' : '❌'} Passwords must match</li>
            </ul>
        </div>
    );
}

export default PasswordValidator;