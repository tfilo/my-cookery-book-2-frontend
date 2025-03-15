import React, { useContext } from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.scss';
import useRouter from './hooks/use-router';
import { AuthContext } from './store/auth-context';

const App: React.FC = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const router = useRouter(isLoggedIn);

    return (
        <RouterProvider
            router={router}
            key={isLoggedIn.toString()}
        />
    );
};

export default App;
