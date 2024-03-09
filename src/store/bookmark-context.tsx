import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pictureApi, recipeApi } from '../utils/apiWrapper';
import { Stack } from 'react-bootstrap';
import defImg from '../assets/defaultRecipe.jpg';
import { useMatch, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();

    const isSelected = match?.params?.recipeId === recipeId.toString();

    useEffect(() => {
        let url: string | null = null;
        (async () => {
            try {
                const recipe = await queryClient.fetchQuery({
                    queryKey: ['recipes', recipeId] as const,
                    queryFn: async ({ queryKey }) => recipeApi.getRecipe(queryKey[1])
                });
                if (recipe && recipe.pictures.length > 0) {
                    const data = await queryClient.fetchQuery({
                        queryKey: ['thumbnails', recipe.pictures[0].id] as const,
                        queryFn: async ({ queryKey }) => pictureApi.getPictureThumbnail(queryKey[1])
                    });
                    if (data instanceof Blob) {
                        url = URL.createObjectURL(data);
                        setUrl(url);
                    }
                    setTitle(recipe.name);
                } else {
                    setUrl(null);
                }
            } catch (e) {}
        })();
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [queryClient, recipeId]);

    const onClickHandler = useCallback(() => {
        navigate('/recipe/display/' + recipeId);
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
                className='rounded-circle border border-light'
                style={{ maxWidth: '64px', opacity: isSelected ? 1 : 0.5 }}
                alt='Založka'
                src={url ?? defImg}
            />
        </button>
    );
};

export const BookmarkContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [bookmarks, setBookmars] = useState<number[]>([]);
    const inRecipes = useMatch('/recipe/display/*');
    const inSearch = useMatch('/recipes/*');

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

    return (
        <>
            <BookmarkContext.Provider value={contextValue}>
                <div className={showBookmarks ? 'pb-5' : ''}>{children}</div>
            </BookmarkContext.Provider>
            {showBookmarks && (
                <Stack
                    direction='horizontal'
                    className='container-fluid position-fixed bottom-0 end-0 start-0 p-3 gap-3 zindex-tooltip align-items-end flex-row-reverse overflow-auto pe-none'
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
