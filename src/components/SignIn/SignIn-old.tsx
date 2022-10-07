import React, { useId, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../store/auth-context';
import { authApi } from '../../utils/apiWrapper';

const SignIn: React.FC = () => {
    const id = useId();
    const [rememberLogin, setRememberLogin] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();
    const [userNameIsValid, setUserNameIsValid] = useState<boolean>(true);
    const [passwordIsValid, setPasswordIsValid] = useState<boolean>(true);

    useEffect(() => {
        authCtx.isLoggedIn && navigate('/home');
    }, [authCtx.isLoggedIn, navigate]);

    const rememberLoginChanged = (event: React.FormEvent<HTMLInputElement>) => {
        setRememberLogin(event.currentTarget.checked);
    };

    const changeName = (event: React.FormEvent<HTMLInputElement>) => {
        setUserName(event.currentTarget.value);
    };

    const changePassword = (event: React.FormEvent<HTMLInputElement>) => {
        setPassword(event.currentTarget.value);
    };

    const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setUserNameIsValid(true);
        setPasswordIsValid(true);

        if (userName.trim().length > 50) {
            setUserNameIsValid(false);
            return;
        }

        if (password.trim().length > 255) {
            setPasswordIsValid(false);
            return;
        }

        const sendData = {
            username: userName,
            password: password,
        };

        try {
            const response = await authApi.login(sendData);
            authCtx.login(response.token, response.refreshToken);
        } catch (err) {
            const error = err as Response;
            alert('Nastala chyba pri prihlásení. ' + error.statusText);
        };
    };

    return (
        <div>
            <h1>Prihlasovacia obrazovka</h1>
            <form onSubmit={submitHandler}>
                <div>
                    <label htmlFor={`${id}name`}>Prihlasovacie meno:</label>
                    <input
                        id={`${id}name`}
                        type='text'
                        value={userName}
                        onChange={changeName}
                    ></input>
                </div>
                {!userNameIsValid && <p>Neplatné používateľského meno.</p>}
                <div>
                    <label htmlFor={`${id}password`}>Heslo:</label>
                    <input
                        id={`${id}password`}
                        type='password'
                        value={password}
                        onChange={changePassword}
                    ></input>
                </div>
                {!passwordIsValid && <p>Neplatné heslo.</p>}
                <div>
                    <input
                        id={`${id}login`}
                        type='checkbox'
                        checked={rememberLogin}
                        onChange={rememberLoginChanged}
                    />
                    <label htmlFor={`${id}login`}> Zapamätať prihlásenie</label>
                </div>
                <button type='submit'>Prihlásiť sa</button>
            </form>
        </div>
    );
};

export default SignIn;
