import axios from 'axios';

const HOST = 'http://127.0.0.1:8000';

export const endpoints = {
    post: '/post/',
    wait_post: '/post/wait-approved/',
    postdetail: (postId) => `/post/${postId}/`,
    postimage: (postID) => `/post/${postID}/images/`,
    room: '/room/',
    deletepost: (postId) => `/post/${postId}/`,
    updatepost: (postId) => `/post/${postId}/`,
    updateroom: (roomId) => `/room/${roomId}/`,
    deleteroom: (roomId) => `/room/${roomId}/`,
    roomdetail: (roomId) => `/room/${roomId}/`,
    login: '/o/token/',
    detailuser: (userId) => `/user/${userId}/`,
    register: '/user/',
    currentuser: '/user/current_user/',
    mypost: '/user/my-post/',
    myfavorite: '/user/my-favorites/',
    myrooms: '/user/my-rooms/',
    roomtype: '/roomtype/',
    amenities: '/amenities/',
    addroomprices: (roomdId) => `/room/${roomdId}/prices/`,
    detailamenities: (amenitiesId) => `/amenities/${amenitiesId}/`,
    createFavorite: '/user/favorite-post/',
    resetpassword: '/reset-password/',
    updateamenities: (amenitiesId) => `/amenities/${amenitiesId}/`,
    changepassword: '/user/change-password/',
    supportrequest: '/support-request/',
    postuser: (userId) => `/user/${userId}/posts/`,
    reviewlandlord: (userId) => `/user/${userId}/review/`,
    review: '/review/',
    follow: (userId) => `/user/${userId}/follow/`,
    following: (userId) => `/user/${userId}/following/`,
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
