import React, { useEffect, useState } from 'react';
import API, { endpoints } from '../../../API';
import { useParams } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';

function DetailPost() {
    return (
        <div className="bg-slate-50">
            <Header />
            <div className="w-[1024px] flex m-auto"></div>
        </div>
    );
}

export default DetailPost;

// function DetailPost() {
//   const { postId } = useParams();
//   const [post, setPost] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         let res = await API.get(endpoints["postdetail"](postId));
//         setPost(res.data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchPost();
//   }, [postId]);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!post) {
//     return <div>Loading...</div>;
//   }
//   // Cấu hình cho Slider
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     customPaging: (i) => (
//       <div>
//         {i + 1} / {post.images.length}
//       </div>
//     ),
//   };

//   return (
//     <div className="detail-post">
//       <div className="content">
//         <div className="container">
//           <div className="leftside">
//             {/* Title */}
//             <h2 className="post-title">{post.title}</h2>
//             {/* Main Image */}
//             <div className="post-images">
//               {post.images.map((img) => (
//                 <img
//                   key={img.id}
//                   src={img.url}
//                   alt={`Image ${img.id}`}
//                   className="post-image"
//                 />
//               ))}
//             </div>
//             {/* Room Price & Address */}
//             <div className="room-info">
//               <h3>Giá: {post.room.price} VND</h3>
//               <p>
//                 Địa chỉ:{" "}
//                 {`${post.room.ward}, ${post.room.district}, ${post.room.city}`}
//               </p>
//               <p>Diện tích: {post.room.area} m²</p>
//             </div>
//             {/* Amenities */}
//             <div className="amenities">
//               <h3>Tiện ích</h3>
//               <ul>
//                 {post.room.amenities.map((amenity) => (
//                   <li key={amenity.id}>{amenity.name}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           <div className="rightside">
//             {/* Landlord Information */}
//             <div className="landlord-info">
//               <h3>Người cho thuê</h3>
//               <img
//                 src={post.room.landlord.avatar}
//                 alt={post.room.landlord.username}
//                 className="landlord-avatar"
//               />
//               <p>{`${post.room.landlord.first_name} ${post.room.landlord.last_name}`}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DetailPost;
