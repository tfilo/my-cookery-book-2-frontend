import React from 'react';
import { BookmarkContextObj } from './bookmark-context-types';

export const BookmarkContext = React.createContext<BookmarkContextObj | null>(null);
