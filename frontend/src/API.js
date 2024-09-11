import axios from "axios";

const HOST = "http://127.0.0.1:8000/";

export const endpoints = {
  listuser: "/users/",
  current_user: "/users/current_user/",
  post: "/post/",
  room: "/room/",
  roomdetail: (roomId) => `/room/${roomId}/`,
  postdetail: (postId) => `/post/${postId}/`,
  login: "/o/token/",
  register: "/users/",
  room_type: "/room_type/",
  amenities: "/amenities/",
};

// Function to create an axios instance with the authorization token
export const authApi = () => {
  const accessToken = localStorage.getItem("access-token");
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
