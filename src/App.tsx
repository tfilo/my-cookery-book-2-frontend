import React, { Fragment, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import { AuthContext } from './store/auth-context';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;

    console.log(isLoggedIn);

    return (
        <Fragment>
            <main>
                <Routes>
                    {isLoggedIn ? (
                        <Route path='/home' element={<HomePage />} />
                    ) : (
                        <Route path='/signIn' element={<SignInPage />} />
                    )}

                    <Route
                        path='*'
                        element={
                            <Navigate
                                replace
                                to={isLoggedIn ? '/home' : '/signIn'}
                            />
                        }
                    />
                </Routes>
            </main>
        </Fragment>
    );
}

export default App;
