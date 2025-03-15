import React, { type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pictureApi, recipeApi } from '../utils/apiWrapper';
import { Stack } from 'react-bootstrap';
import defImg from '../assets/defaultRecipe.jpg';
import { useMatch, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './auth-context';

const BOOKMARKS_KEY = 'bookmarks' as const;

type BookmarkContextObj = {
    addRecipe: (recipeId: number) => void;
    removeRecipe: (recipeId: number) => void;
    contains: (recipeId: number) => boolean;
    clear: () => void;
};

export const BookmarkContext = React.createContext<BookmarkContextObj | null>(null);

export const useBookmarContext = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarContext must be used within BookmarkContextProvider');
    }
    return context;
};

const CleanBookmarksButton: React.FC<{ clear: () => void }> = ({ clear }) => {
    return (
        <button
            className='btn btn-danger rounded-circle p-0 m-0 pe-auto mcb-bookmark-clear-btn'
            onClick={clear}
            title='Odstrániť záložky'
        >
            <FontAwesomeIcon
                icon={faXmark}
                className='mcb-bookmark-clear-btn_icon'
            />
        </button>
    );
};

const Bookmark: React.FC<{ recipeId: number }> = ({ recipeId }) => {
    const match = useMatch('/recipe/:recipeId');
    const navigate = useNavigate();
    const [url, setUrl] = useState<string | undefined | null>(undefined);
    const isSelected = match?.params?.recipeId === recipeId.toString();

    const { data: recipe, isLoading: isLoadingRecipe } = useQuery({
        queryKey: ['recipes', recipeId] as const,
        queryFn: ({ queryKey }) => recipeApi.getRecipe(queryKey[1])
    });

    const pictureId = recipe?.pictures[0]?.id;
    const title = recipe?.name;

    const { data: thumbnail, isLoading: isLoadingThumbnail } = useQuery({
        queryKey: ['thumbnails', pictureId] as const,
        queryFn: async ({ queryKey }) => pictureApi.getPictureThumbnail(queryKey[1]!),
        enabled: !!pictureId
    });

    useEffect(() => {
        if (!isLoadingRecipe && !isLoadingThumbnail) {
            if (!!thumbnail && thumbnail instanceof Blob) {
                const url = URL.createObjectURL(thumbnail);
                setUrl(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setUrl(null);
            }
        }
    }, [thumbnail, isLoadingRecipe, isLoadingThumbnail]);

    const onClickHandler = useCallback(() => {
        navigate('/recipe/' + recipeId);
    }, [navigate, recipeId]);

    if (url === undefined) {
        return null;
    }

    return (
        <button
            className='btn btn-link p-0 m-0 pe-auto'
            onClick={onClickHandler}
            title={title}
        >
            <img
                className='rounded-circle mcb-bookmark-thumbnail'
                style={{ opacity: isSelected ? 1 : 0.5 }}
                alt='Založka'
                src={url ?? defImg}
            />
        </button>
    );
};

const getStoredBookmarks = () => {
    const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (storedBookmarks) {
        const splittedStringIds = storedBookmarks.split(',');
        const mappedIds = splittedStringIds.map((id) => +id);
        const numericIds = mappedIds.filter((id) => !isNaN(id));
        return numericIds;
    }
    return [];
};

const setStoredBookmarks = (bookmarks: number[], hasCookieConsent: boolean) => {
    if (bookmarks.length === 0) {
        localStorage.removeItem(BOOKMARKS_KEY);
    } else if (hasCookieConsent) {
        localStorage.setItem(BOOKMARKS_KEY, bookmarks.join(','));
    }
};

export const BookmarkContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { userId, hasCookieConsent } = useContext(AuthContext);
    const [bookmarks, setBookmars] = useState<number[]>(getStoredBookmarks());
    const inRecipes = useMatch('/recipe/:recipeId');
    const inSearch = useMatch('/recipes');

    const showBookmarks = (inRecipes || inSearch) && bookmarks.length > 0;

    const addRecipe = useCallback((recipeId: number) => {
        setBookmars((prev) => {
            const existing = prev.find((id) => id === recipeId);
            if (existing) {
                return prev;
            }
            return [...prev, recipeId];
        });
    }, []);

    const removeRecipe = useCallback((recipeId: number) => {
        setBookmars((prev) => {
            return prev.filter((id) => id !== recipeId);
        });
    }, []);

    const contains = useCallback(
        (recipeId: number) => {
            return bookmarks.includes(recipeId);
        },
        [bookmarks]
    );

    const clear = useCallback(() => {
        setBookmars([]);
    }, []);

    const contextValue: BookmarkContextObj = useMemo(
        () => ({
            addRecipe,
            removeRecipe,
            clear,
            contains
        }),
        [addRecipe, removeRecipe, clear, contains]
    );

    useEffect(() => {
        setStoredBookmarks(bookmarks, hasCookieConsent);
    }, [bookmarks, hasCookieConsent, userId]);

    return (
        <>
            <BookmarkContext.Provider value={contextValue}>
                <div className={showBookmarks ? 'pb-5' : ''}>{children}</div>
            </BookmarkContext.Provider>
            {showBookmarks && (
                <Stack
                    direction='horizontal'
                    className='position-fixed bottom-0 end-0 gap-3 zindex-tooltip align-items-end flex-row-reverse overflow-auto p-3 mw-100 rounded'
                >
                    <CleanBookmarksButton clear={clear} />
                    {bookmarks.map((recipeId) => {
                        return (
                            <Bookmark
                                key={recipeId}
                                recipeId={recipeId}
                            />
                        );
                    })}
                </Stack>
            )}
        </>
    );
};
