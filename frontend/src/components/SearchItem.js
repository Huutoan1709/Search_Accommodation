import { memo } from 'react';
const SearchItem = ({ text, iconAf, iconBf, className }) => {
    return (
        <div
            className={`
                bg-slate-300 py-3 md:py-4 px-2 w-full rounded-md
                text-[13px] md:text-[14px] flex items-center justify-between
                ${className} h-full transition-all duration-200
                hover:bg-slate-200
            `}
        >
            <div className="flex items-center gap-2 truncate">
                {iconBf}
                <span className="truncate">{text}</span>
            </div>
            {iconAf}
        </div>
    );
};

export default memo(SearchItem);
