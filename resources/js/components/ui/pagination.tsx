import { PaginationData } from "@/types";
import { Link } from "@inertiajs/react";

export const Pagination = ({ products } : { products: PaginationData }) => {

    return (
        <div className="flex items-center justify-between mt-4">
            
            <p>Showing <strong>{products.from}</strong> to <strong>{products.to}</strong> from Total <strong>{products.total}</strong> entries</p>

            <div className="flex gap-2">
                {products.links.map((link, index) => (
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