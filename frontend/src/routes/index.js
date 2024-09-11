import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Room from "../pages/Room";
import Login from "../pages/Login";
const publicroutes = [
  { path: "/", component: Home },
  { path: "/profile", component: Profile },
  { path: "/Room", component: Room },
  { path: "/login", component: Login },
];
const privateRoutes = [{ path: "/profile", component: Profile }];
export { publicroutes, privateRoutes };
