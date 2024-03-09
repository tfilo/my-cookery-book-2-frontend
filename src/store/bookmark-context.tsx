import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pictureApi, recipeApi } from '../utils/apiWrapper';
import { Stack } from 'react-bootstrap';
import defImg from '../assets/defaultRecipe.jpg';
import { useMatch, useNavigate } from 'react-router-dom';

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

const Bookmark: React.FC<{ recipeId: number }> = ({ recipeId }) => {
    const match = useMatch('/recipe/display/:recipeId');
    const navigate = useNavigate();
    const [url, setUrl] = useState<string | undefined | null>(undefined);
    const [title, setTitle] = useState<string>('');

    const isSelected = match?.params?.recipeId === recipeId.toString();

    useEffect(() => {
        let url: string | null = null;
        let abortController = new AbortController();
        (async () => {
            try {
                const recipe = await recipeApi.getRecipe(recipeId, {
                    signal: abortController.signal
                });
                if (recipe && recipe.pictures.length > 0) {
                    if (!abortController.signal.aborted) {
                        const data = await pictureApi.getPictureThumbnail(recipe.pictures[0].id, {
                            signal: abortController.signal
                        });
                        if (data instanceof Blob) {
                            if (!abortController.signal.aborted) {
                                url = URL.createObjectURL(data);
                                setUrl(url);
                            }
                        }
                    }
                    setTitle(recipe.name);
                } else {
                    setUrl(null);
                }
            } catch (e) {}
        })();
        return () => {
            abortController.abort();
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [recipeId]);

    const onClickHandler = useCallback(() => {
        navigate('/recipe/display/' + recipeId);
    }, [navigate, recipeId]);

    if (url === undefined) {
        return null;
    }

    return (
        <button
            className='btn btn-link p-0 m-0'
            onClick={onClickHandler}
            title={title}
        >
            <img
                className='rounded-circle border border-light'
                style={{ maxWidth: '64px', opacity: isSelected ? 1 : 0.4 }}
                alt='Založka'
                src={url ?? defImg}
            />
        </button>
    );
};

export const BookmarkContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [bookmarks, setBookmars] = useState<number[]>([]);

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

    return (
        <>
            <BookmarkContext.Provider value={contextValue}>{children}</BookmarkContext.Provider>
            {bookmarks.length > 0 && (
                <Stack
                    direction='horizontal'
                    className='container-fluid position-fixed bottom-0 end-0 start-0 p-3 gap-3 zindex-tooltip align-items-end flex-row-reverse overflow-auto'
                >
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
