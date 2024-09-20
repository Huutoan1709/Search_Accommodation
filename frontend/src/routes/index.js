import Home from '../pages/Home';
import Register from '../pages/User/Register';
import Login from '../pages/User/Login';
import Profile from '../pages/User/Profile';
import DetailPost from '../pages/Post/DetailPost';
import search from '../pages/DefaultLayout/Search';
import Updateinfo from '../pages/User/Updateinfo';
import ManagePost from '../pages/Post/ManagePost';
import ManageRoom from '../pages/Room/ManageRoom';
import CreatePost from '../pages/Post/CreatePost';

const publicroutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/post/:postId', component: DetailPost },
    { path: '/search', component: search },
];
const profileRoutes = [
    { path: 'createpost', component: CreatePost },
    { path: 'managepost', component: ManagePost },
    { path: 'manageroom', component: ManageRoom },
    { path: 'updateinfo', component: Updateinfo },
];
const privateRoutes = [{ path: '/profile/*', component: Profile, children: profileRoutes }];

export { publicroutes, privateRoutes, profileRoutes };
