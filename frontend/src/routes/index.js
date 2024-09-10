import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Room from "../pages/Room";
const publicroutes = [
  { path: "/", component: Home },
  { path: "/profile", component: Profile },
  { path: "/Room", component: Room },
];
const privateRoutes = [];
export { publicroutes, privateRoutes };
