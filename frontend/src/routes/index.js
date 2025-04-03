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
import FavoritePost from '../pages/Post/FavoritePost';
import ResetPassword from '../pages/User/ResetPassword';
import MapBox from '../components/MapBox';
import changepassword from '../pages/User/changepassword';
import SupportRequest from '../pages/SupportRequest';
import Personal from '../pages/User/Personal';
import NhaNguyenCan from '../pages/Home/Nhanguyencan';
import ChungCu from '../pages/Home/ChungCu';
import CanHoDichVu from '../pages/Home/CanHoDichVu';
import HomeAdmin from '../pages/Admin/HomeAdmin';
import AdminUser from '../pages/Admin/AdminUser';
import AdminPost from '../pages/Admin/AdminPost';
import AdminOverview from '../pages/Admin/AdminOverview';
import ApprovedPost from '../pages/Admin/ApprovedPost';
import MyReviews from '../pages/User/Myreviews/MyReview';
import AdminRoomType from '../pages/Admin/AdminRoomType';
import AdminSupportRequest from '../pages/Admin/AdminSupportRequest';
import ChatBot from '../components/ChatBot';
import CreateModalVideo from '../components/CreateModalVideo';
const publicroutes = [
    { path: '/', component: Home },

    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/post/:postId', component: DetailPost },
    { path: '/search', component: search },
    { path: '/reset-password', component: ResetPassword },
    { path: '/map', component: MapBox },
    { path: '/profiles/:userId', component: Personal },
    { path: '/nha-nguyen-can', component: NhaNguyenCan },
    { path: '/chung-cu', component: ChungCu },
    { path: '/can-ho-dich-vu', component: CanHoDichVu },
    { path: '/chatbot', component: ChatBot },
];
const profileRoutes = [
    { path: 'createpost', component: CreatePost },
    { path: 'managepost', component: ManagePost },
    { path: 'manageroom', component: ManageRoom },
    { path: 'updateinfo', component: Updateinfo },
    { path: 'myreviews', component: MyReviews },
];
const AdminRoutes = [
    { path: '/admin', component: AdminOverview },
    { path: 'listuser', component: AdminUser },
    { path: 'post', component: AdminPost },
    { path: 'approved-post', component: ApprovedPost },
    { path: 'roomtype', component: AdminRoomType },
    { path: 'supportrequest', component: AdminSupportRequest },
];

const privateRoutes = [
    { path: '/profile/*', component: Profile, children: profileRoutes },
    { path: '/admin/*', component: HomeAdmin, children: AdminRoutes },
    { path: '/favorite', component: FavoritePost },
    { path: '/supportrequest', component: SupportRequest },
    { path: '/changepassword', component: changepassword },
];

export { publicroutes, privateRoutes, profileRoutes };
