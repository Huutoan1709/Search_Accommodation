import axios from 'axios';


const HOST = 'http://127.0.0.1:8000';

export const endpoints = {
    post: '/post/',
    wait_post: '/post/wait-approved/',
    postdetail: (postId) => `/post/${postId}/`,
    postimage: (postID) => `/post/${postID}/images/`,
    postvideo: (postID) => `/post/${postID}/video/`,
    room: '/room/',
    deletepost: (postId) => `/post/${postId}/`,
    updatepost: (postId) => `/post/${postId}/`,
    updateroom: (roomId) => `/room/${roomId}/`,
    deleteroom: (roomId) => `/room/${roomId}/`,
    roomdetail: (roomId) => `/room/${roomId}/`,
    login: '/o/token/',
    detailuser: (userId) => `/user/${userId}/`,
    register: '/user/',
    listuser: '/user/',
    currentuser: '/user/current_user/',
    mypost: '/user/my-post/',
    myfavorite: '/user/my-favorites/',
    myrooms: '/user/my-rooms/',
    roomtype: '/roomtype/',
    deleteroomtype: (roomtypeId) => `/roomtype/${roomtypeId}/`,
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
    deleteImage: (postId, imageId) => `/post/${postId}/images/${imageId}/`,
    deletevideo: (postId) => `/post/${postId}/deletevideo/`,
    myreviews: '/user/my-reviews/',
    updatereview: (reviewId) => `/review/${reviewId}/`,
    deleteSupportRequest: (requestId) => `/support-request/${requestId}/`,
    deleteUser: (userId) => `/user/${userId}/`,
    detailuseradmin: (userId) => `/user/${userId}/`,
    updateUser: (userId) => `/user/${userId}/`,
    deleteUser: (userId) => `/user/${userId}/`,
    searchhistory: '/search-history/',
    recommendedrooms: '/recommendations/recommended-rooms/',
    PhoneOTPReset: '/phone-reset-password/',
    posttype: '/post-type/',
    paymentcreate: '/payment/create_payment/',
    paymentreturn: '/payment/vnpay-return/',
    mypaymenthistory: '/payment/my-payment/',
    google_login: '/auth/google-login/',
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
