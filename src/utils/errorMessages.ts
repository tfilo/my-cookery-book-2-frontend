export const formatErrorMessage = async (err: any) => {
    if (('name' in err && err.name === 'AbortError') || ('revert' in err && 'silent' in err)) {
        return undefined;
    }
    if (err instanceof Response) {
        try {
            const responseError = await err.json();
            if (responseError.code) {
                return ErrorMessages[responseError.code] ?? 'Nastala neočakávana chyba.';
            } else {
                return ErrorMessages[err.statusText] ?? 'Nastala neočakávana chyba.';
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

const ErrorMessages: { [name: string]: string } = {
    Unauthorized: 'Nemáte oprávnenie',
    GENERAL_ERROR: 'Nastala neznáma chyba',
    DATABASE_ERROR: 'Chyba spojenia s databázou',
    NOT_FOUND: 'Vyžadovaný záznam sa nenašiel',
    VALIDATION_FAILED: 'Nesprávny vstup',
    INVALID_CREDENTIALS: 'Nesprávne prihlasovacie údaje!',
    FORBIDEN: 'Neplatný prístup',
    EXPIRED_TOKEN: 'Vypršaná autentifikácia',
    INVALID_TOKEN: 'Neplatná autentifikácia',
    UNIQUE_CONSTRAINT_ERROR: 'Záznam s rovnakými parametrami už existuje',
    CONSTRAINT_FAILED: 'Nemožno odstrániť, daný záznam sa používa'
};
