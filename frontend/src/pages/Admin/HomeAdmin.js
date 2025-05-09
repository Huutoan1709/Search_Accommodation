import React from 'react';
import { useRoutes } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminPost from './AdminPost';
import AdminUser from './AdminUser';
import ApprovedPost from './ApprovedPost';
import AdminRoomType from './AdminRoomType';
import AdminSupportRequest from './AdminSupportRequest';
import AdminAmenities from './AdminAmenities';

const HomeAdmin = () => {
    let element = useRoutes([
        { path: '/overview', element: <AdminOverview /> },
        { path: '/post', element: <AdminPost /> },
        { path: '/approved-post', element: <ApprovedPost /> },
        { path: '/roomtype', element: <AdminRoomType /> },
        { path: '/listuser', element: <AdminUser /> },
        { path: '/supportrequest', element: <AdminSupportRequest /> },
        { path: '/amenities', element: <AdminAmenities /> },
    ]);

    return (
        <div className="w-full flex flex-col max-h-screen">
            <div className="flex w-full flex-auto">
                <AdminSidebar />
                <div className="flex-auto bg-[#F3F4F6] shadow-md overflow-auto">
                    <div>{element}</div>
                </div>
            </div>
        </div>
    );
};

export default HomeAdmin;
