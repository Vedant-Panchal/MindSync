import React from 'react';
import { BrowserRouter } from 'react-router';

interface AppProviderProps {
    children?: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
};

export default AppProvider;
