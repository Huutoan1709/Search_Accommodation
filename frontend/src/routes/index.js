import Home from '../pages/Home';
import ListRoom from '../pages/Room/ListRoom';
import Register from '../pages/User/Register';
import Login from '../pages/User/Login';
import Profile from '../pages/User/Profile';
import DetailPost from '../pages/Post/DetailPost';
import search from '../pages/DefaultLayout/Search';
import Updateinfo from '../pages/User/Updateinfo';
const publicroutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/post/:postId', component: DetailPost },
    { path: '/search', component: search },
];
const privateRoutes = [
    { path: '/profile', component: Profile },
    { path: '/manageroom', component: ListRoom },
    { path: '/Updateinfo', component: Updateinfo },
];

export { publicroutes, privateRoutes };
