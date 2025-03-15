import { useContext } from 'react';
import { BookmarkContext } from '../store/bookmark-context';

export const useBookmarContext = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarContext must be used within BookmarkContextProvider');
    }
    return context;
};
