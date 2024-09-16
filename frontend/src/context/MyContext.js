import React from 'react';

const MyContext = React.createContext({
    user: null,
    login: () => {},
    logout: () => {},
    fetchUser: () => {},
});

export default MyContext;
