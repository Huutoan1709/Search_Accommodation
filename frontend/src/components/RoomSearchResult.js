import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaMapMarkerAlt, FaRuler, FaMoneyBillWave } from 'react-icons/fa';

const RoomSearchResult = ({ post }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/post/${post.id}`);
    };

    // Get amenities list
    const getAmenities = () => {
        if (!post?.room?.amenities) return [];
        return post.room.amenities.slice(0, 3); // Show first 3 amenities
    };

    return (
        <div 
            className="flex cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition-all"
            onClick={handleClick}
        >
            {/* Image Section */}
            <div className="relative w-24 h-24 flex-shrink-0">
                <img 
                    src={post?.images?.[0]?.url || '/placeholder-room.jpg'} 
                    alt={post?.title}
                    className="w-full h-full object-cover rounded-lg"
                />
                {post?.post_type?.name === 'VIP' && (
                    <span className="absolute top-0 left-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg">
                        VIP
                    </span>
                )}
            </div>

            {/* Content Section */}
            <div className="ml-3 flex-1 min-w-0">
                {/* Title */}
                <h3 className="font-semibold text-base text-gray-800 mb-1 truncate">
                    {post?.title}
                </h3>

                {/* Price */}
                <div className="flex items-center text-red-500 font-semibold text-base mb-1">
                    <FaMoneyBillWave className="mr-1" />
                    {post?.room?.price} triệu/tháng
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 text-base mb-1">
                    <FaMapMarkerAlt className="mr-1" />
                    <span className="truncate">
                        {post?.room?.ward}, {post?.room?.district}
                    </span>
                </div>

                {/* Room Details */}
                <div className="flex items-center gap-3 text-base text-gray-500">
                    {/* Area */}
                    <div className="flex items-center">
                        <FaRuler className="mr-1" />
                        {post?.room?.area}m²
                    </div>

                    {/* Room Type */}
                    <div className="flex items-center">
                        <FaBed className="mr-1" />
                        {post?.room?.room_type?.name}
                    </div>
                </div>

                {/* Amenities */}
                {getAmenities().length > 0 && (
                    <div className="flex gap-1 mt-1">
                        {getAmenities().map((amenity, idx) => (
                            <span 
                                key={idx}
                                className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full"
                            >
                                {amenity.name}
                            </span>
                        ))}
                        {post?.room?.amenities?.length > 3 && (
                            <span className="text-lg text-gray-500">
                                +{post.room.amenities.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomSearchResult;