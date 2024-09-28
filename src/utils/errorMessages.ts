import { getErrorMessageLabel } from '../localisations/localisations';

export const formatErrorMessage = async (err: any) => {
    if (('name' in err && err.name === 'AbortError') || ('revert' in err && 'silent' in err)) {
        return undefined;
    }
    if (err instanceof Response) {
        try {
            const responseError = await err.json();
            if (responseError.code) {
                return getErrorMessageLabel[responseError.code] ?? 'Nastala neočakávana chyba.';
            } else {
                return getErrorMessageLabel[err.statusText] ?? 'Nastala neočakávana chyba.';
            }
        } catch (e) {
            console.error(e);
            return 'Nastala neočakávana chyba.';
        }
    } else {
        console.error(err);
        return 'Nastala neočakávana chyba.';
    }
};
