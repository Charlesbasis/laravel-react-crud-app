import { SortField, SortProps } from "@/types";

export const SortableHeader = ({ field, currentSort, onSort, children, className }: { field: SortField, currentSort: SortProps, onSort: (field: SortField) => void, children: React.ReactNode, className?: string }) => {

    const isActive = currentSort.field === field;

    return (
        <th
            className={`${className} cursor-pointer hover-bg-gray-600 transition-colors ${isActive ? 'bg-gray-700 text-white' : ''}`}
            onClick={() => onSort(field)}
        >
            <div className="flex items-center justify-between">
                <span>{children}</span>
                <div>
                    <span
                        className={`${isActive && currentSort.direction === 'asc' ? 'text-white' : 'text-gray-500'}`}
                    >
                        ↑
                    </span>
                    <span
                        className={`${isActive && currentSort.direction === 'desc' ? 'text-white' : 'text-gray-500'}`}
                    >
                        ↓
                    </span>
                </div>
            </div>
        </th>
    );
}
