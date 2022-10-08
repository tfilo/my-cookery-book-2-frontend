export const formatErrorMessage = (err: Response) => {
    return ErrorMessages[err.statusText] ?? 'Nastala neočakávana chyba.';
} 

const ErrorMessages: { [name: string]: string } = {
    Unauthorized: 'Nesprávne prihlasovacie údaje!',
    Other: 'Iná chyba',
};
