import axios from 'axios';

const HOST = 'http://127.0.0.1:8000/';

export const endpoints = {
    post: '/post/',
    wait_post: '/post/wait-approved/',
    postdetail: (postId) => `/post/${postId}/`,
    room: '/room/',
    updateroom: (roomId) => `/room/${roomId}/`,
    deleteroom: (roomId) => `/room/${roomId}/`,
    roomdetail: (roomId) => `/room/${roomId}/`,
    login: '/o/token/',
    register: '/user/',
    currentuser: '/user/current_user/',
    mypost: 'user/my-post/',
    myfavorite: 'user/my-favorites/',
    myrooms: 'user/my-rooms/',
    roomtype: '/roomtype/',
    amenities: '/amenities/',
    addroomprices: (roomdID) => `/room/${roomdID}/prices/`,
    detailamenities: (amenitiesId) => `/amenities/${amenitiesId}/`,
};

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
