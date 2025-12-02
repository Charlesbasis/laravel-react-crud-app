import { PerPageSelectorProps } from "@/types";
import { router } from "@inertiajs/react";
import React, { useCallback, useEffect } from "react";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export const PerPageSelector = ({
    currentPerPage,
    perPageOptions,
    filters,
    route,
    className,
}: PerPageSelectorProps) => {
    const [selectedValue, setSelectedValue] = React.useState<number>(currentPerPage);

    const handlePerPageChange = useCallback((value: string) => {
        const newValue = parseInt(value, 10);

        setSelectedValue(newValue);

        const params = {
            ...filters,
            per_page: newValue,
        };

        const queryParams: Record<string, any> = {};
        Object.keys(params).forEach((key) => {
            // @ts-ignore
            if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
                // @ts-ignore
                queryParams[key] = params[key];
            }
        });

        router.get(route, queryParams, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, [filters, route]);

    useEffect(() => {
        setSelectedValue(currentPerPage);
    }, [currentPerPage]);

    // console.log('from page select:', perPageOptions)
    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="perPage">
                Items per page
            </Label>
            <Select
                value={selectedValue}
                onValueChange={handlePerPageChange}
            >
                <SelectTrigger className="h-9 w-[70px]">
                    <SelectValue placeholder={selectedValue} />
                </SelectTrigger>
                <SelectContent>
                    {perPageOptions.map((perPage) => (
                        <SelectItem key={perPage} value={perPage}>
                            {perPage}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
