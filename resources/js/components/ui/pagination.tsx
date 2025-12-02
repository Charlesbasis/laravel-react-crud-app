import { PaginationData } from "@/types";
import { Link } from "@inertiajs/react";
import { PerPageSelector } from "./per-page-selector";

export const Pagination = ({ products, showPerPageInfo = true, perPageOptions } : { products: PaginationData, showPerPageInfo?: boolean, perPageOptions?: number[] }) => {

    console.log('Products:', products);
    return (
        <div className="flex items-center justify-between mt-4">
            
            <p>Showing <strong>{products?.from}</strong> to <strong>{products?.to}</strong> from Total <strong>{products?.total}</strong> entries</p>

            {showPerPageInfo && 
                <PerPageSelector
                    currentPerPage={products?.current_page}
                    perPageOptions={perPageOptions as number[]}
                    filters={{}}
                    route={''}
                />
            }
            
            <div className="flex gap-2">
                {products?.links?.map((link, index) => (
                    <Link
                        className={`px-3 py-2 border rounded ${link.active ? 'bg-gray-700 text-white' : ''}`}
                        href={link.url || '#'}
                        key={index}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />                    
                ))}
            </div>
        </div>
    );
}
