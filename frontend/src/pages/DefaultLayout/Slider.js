import { memo } from 'react';
import React from 'react';
import Slider from 'react-slick';

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
};

const SliderCustom = ({ images, video }) => {
    // Tạo danh sách hiển thị, ưu tiên video trước
    let sliderItems = [];

    if (video) {
        sliderItems.push({ type: 'video', url: video });
    }

    if (images?.length > 0) {
        sliderItems = [...sliderItems, ...images.map((image) => ({ type: 'image', url: image.url }))];
    }

    return (
        <div className="w-full">
            <Slider {...settings}>
                {sliderItems.map((item, index) => (
                    <div key={index} className="bg-black flex items-center justify-center h-[200px] md:h-[320px] px-4 md:px-12">
                        {item.type === 'video' ? (
                            <video controls className="max-h-full m-auto h-full object-contain">
                                <source src={item.url} type="video/mp4" />
                                Trình duyệt của bạn không hỗ trợ video.
                            </video>
                        ) : (
                            <img
                                src={item.url}
                                alt={`slide-${index}`}
                                className="max-h-full m-auto h-full object-contain"
                            />
                        )}
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default memo(SliderCustom);
