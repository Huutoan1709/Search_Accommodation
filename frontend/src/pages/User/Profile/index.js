import React, { useState } from 'react';
import Header from '../../DefaultLayout/Header';
import SidebarUser from '../../DefaultLayout/SidebarUser';
import CreatePost from '../../Post/CreatePost';
import Updateinfo from '../../User/Updateinfo';
import ManageRoom from '../../Room/ManageRoom';
import ManagePost from '../../Post/ManagePost';
import MyReviews from '../../User/Myreviews/MyReview';
import ReceivedReviews from '../../User/ReceivedReviews';
import PaymentHistory from '../../Payment/PaymentHistory';
import { useRoutes } from 'react-router-dom';
import { RiMenu3Line } from 'react-icons/ri';

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    let element = useRoutes([
        { path: 'createpost', element: <CreatePost /> },
        { path: 'updateinfo', element: <Updateinfo /> },
        { path: 'manageroom', element: <ManageRoom /> },
        { path: 'managepost', element: <ManagePost /> },
        { path: 'myreviews', element: <MyReviews /> },
        { path: 'receivedreviews', element: <ReceivedReviews /> },
        { path: 'paymenthistory', element: <PaymentHistory /> },
    ]);

    return (
        <div className="w-full flex flex-col h-screen">
            <Header className="" />
            <div className="flex w-full flex-auto relative">
                {/* Desktop Sidebar - always visible on lg screens */}
                <div className="hidden lg:block bg-[#fff]">
                    <SidebarUser />
                </div>

                {/* Mobile/Tablet Sidebar - slides in from left */}
                {isSidebarOpen && (
                    <>
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        {/* Sidebar */}
                        <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
                            <SidebarUser onClose={() => setIsSidebarOpen(false)} />
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-auto bg-[#fff] shadow-md p-4 md:p-7 overflow-auto">
                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden fixed bottom-6 left-6 z-30 bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <RiMenu3Line size={24} />
                    </button>

                    {element}
                </div>
            </div>
        </div>
    );
};

export default Profile;
