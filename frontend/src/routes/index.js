import Home from "../pages/Home";
import Profile from "../pages/Profile";
const publicroutes = [
  { path: "/", component: Home },
  { path: "/profile", component: Profile },
];
const privateRoutes = [];
export { publicroutes, privateRoutes };
