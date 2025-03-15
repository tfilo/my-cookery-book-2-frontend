import { useCallback, useContext } from 'react';
import { AuthContext } from '../store/auth-context';

const useRole = () => {
    const authCtx = useContext(AuthContext);

    const hasSome = useCallback((...roles: string[]) => authCtx.userRoles.some((role) => roles.includes(role)), [authCtx]);
    const isOwner = useCallback((objectOwnerId: number) => objectOwnerId === authCtx.userId, [authCtx]);

    return {
        hasSome,
        isOwner
    };
};

export default useRole;
