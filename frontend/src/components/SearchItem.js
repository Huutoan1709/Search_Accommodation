import { memo } from 'react';
const SearchItem = ({ text, iconAf, iconBf, fontWeight }) => {
    return (
        <div className="bg-slate-300 py-2 px-2 w-full rounded-md  text-[13px] flex items-center justify-between">
            <div className="flex items-center gap-1">
                {iconBf}
                <span className={fontWeight && 'font-medium text-black'}>{text}</span>
            </div>
            {iconAf}
        </div>
    );
};

export default memo(SearchItem);
