import axios from 'axios';

const HOST = 'http://127.0.0.1:8000/';

export const endpoints = {
    post: '/post/',
    wait_post: '/post/wait-approved/',
    postdetail: (postId) => `/post/${postId}/`,
    room: '/room/',
    roomdetail: (roomId) => `/room/${roomId}/`,

    login: '/o/token/',
    register: '/user/',
    roomtype: '/roomtype/',
    amenities: '/amenities/',
    detailamenities: (amenitiesId) => `/amenities/${amenitiesId}/`,
};

// Function to create an axios instance with the authorization token
export const authApi = () => {
    const accessToken = localStorage.getItem('access-token');
    return axios.create({
        baseURL: HOST,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// Default axios instance
export default axios.create({
    baseURL: HOST,
});
