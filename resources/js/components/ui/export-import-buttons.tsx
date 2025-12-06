import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { saveAs } from 'file-saver';

interface ExportImportButtonsProps {
    filters: {
        search?: string;
        min_price?: string;
        max_price?: string;
        sort?: string;
        direction?: string;
    };
}

export function ExportImportButtons({ filters }: ExportImportButtonsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        message: string;
        errors?: any[];
    } | null>(null);

    const handleExport = () => {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                queryParams.append(key, value.toString());
            }
        });
        
        window.location.href = `/products/export?${queryParams.toString()}`;
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/products/import', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const result = await response.json();
            
            setImportResult(result);

            if (result.success) {
                // Refresh the page to show imported products
                setTimeout(() => {
                    router.reload({ only: ['products'] });
                }, 1500);
            }
        } catch (error) {
            setImportResult({
                success: false,
                message: 'Failed to import file. Please try again.',
            });
        } finally {
            setIsImporting(false);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const downloadTemplate = () => {
        window.location.href = '/products/import/template';
    };

    const clearResult = () => {
        setImportResult(null);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Export Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
            >
                <Download size={16} />
                Export
            </Button>

            {/* Import Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2"
            >
                <Upload size={16} />
                {isImporting ? 'Importing...' : 'Import'}
            </Button>

            {/* Template Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
            >
                <FileSpreadsheet size={16} />
                Template
            </Button>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
            />

            {/* Import Result Messages */}
            {importResult && (
                <div className={`ml-2 p-2 rounded text-sm flex items-center gap-2 ${
                    importResult.success 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {importResult.success ? (
                        <CheckCircle size={16} className="text-green-600" />
                    ) : (
                        <AlertCircle size={16} className="text-red-600" />
                    )}
                    <span>{importResult.message}</span>
                    <button 
                        onClick={clearResult}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
