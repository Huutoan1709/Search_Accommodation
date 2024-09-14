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

const SliderCustom = ({ images }) => {
    return (
        <div className="w-full">
            <Slider {...settings}>
                {images?.map((image, index) => (
                    <div key={index} className=" bg-black flex items-center justify-center h-[320px] px-12">
                        <img
                            src={image.url}
                            alt={`slide-${index}`}
                            className="max-h-full m-auto h-full object-contain"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default memo(SliderCustom);
