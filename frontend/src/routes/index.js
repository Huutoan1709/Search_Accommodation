import Home from "../pages/Home";
import Room from "../pages/Room";
import Register from "../pages/User/Register";
import Login from "../pages/User/Login";
import Profile from "../pages/User/Profile";
import DetailPost from "../pages/Post/DetailPost";
import search from "../pages/DefaultLayout/Search";
const publicroutes = [
  { path: "/", component: Home },
  { path: "/Room", component: Room },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/post/:postId", component: DetailPost },
  { path: "/search", component: search },
];
const privateRoutes = [{ path: "/profile", component: Profile }];
export { publicroutes, privateRoutes };
