import { memo } from 'react';
const SearchItem = ({ text, iconAf, iconBf, fontWeight, className }) => {
    return (
        <div
            className={`bg-slate-300 py-4 px-2 w-full rounded-md  text-[14px] flex items-center justify-between ${className} h-full`}
        >
            <div className="flex items-center">
                {iconBf}
                <span className="ml-2">{text}</span>
            </div>
            {iconAf}
        </div>
    );
};

export default memo(SearchItem);
