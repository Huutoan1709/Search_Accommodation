import React, { memo } from 'react';
import '../../output.css';

const Button = ({ text, textColor, bgColor, IcAfter, onClick, fullWidth }) => {
    return (
        <button
            type="button"
            className={`p-2 ${textColor} ${bgColor} ${
                fullWidth && 'w-full'
            } outline-none rounded-md hover:underline flex items-center justify-center gap-1`}
            onClick={onClick}
        >
            <span>{text}</span>
            <span>{IcAfter && <IcAfter />}</span>
        </button>
    );
};
export default memo(Button);
