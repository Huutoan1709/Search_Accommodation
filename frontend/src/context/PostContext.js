import React, { createContext, useState, useEffect } from 'react';

import API, { endpoints } from '../API';

const PostContext = createContext({
    posts: [],
    fetchPosts: () => {},
    isLoading: false,
    error: '',
});

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const result = await API.get(endpoints['post']);
            setPosts(result.data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return <PostContext.Provider value={{ posts, fetchPosts, isLoading, error }}>{children}</PostContext.Provider>;
};

export default PostContext;
