import React, { useState, useMemo } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { 
  Download, 
  FileText, 
  Image, 
  File, 
  Archive,
  Eye,
  CheckSquare,
  Square,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
// Note: ZIP functionality requires JSZip package
// For now, we'll implement individual downloads

interface SmartTableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  isFileColumn?: boolean;
  fileType?: 'image' | 'document' | 'video' | 'audio' | 'generic';
  sortable?: boolean;
}

interface SmartTableProps {
  data: any[];
  columns: SmartTableColumn[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  className?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

// File extension to type mapping
const getFileTypeFromUrl = (url: string): 'image' | 'document' | 'video' | 'audio' | 'generic' => {
  if (!url) return 'generic';
  
  const extension = url.toLowerCase().split('.').pop() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return 'image';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return 'document';
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    return 'video';
  }
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
    return 'audio';
  }
  return 'generic';
};

// Auto-detect file columns based on column names and data patterns
const detectFileColumns = (columns: SmartTableColumn[], data: any[]): SmartTableColumn[] => {
  return columns.map(column => {
    // Skip if already marked as file column
    if (column.isFileColumn !== undefined) {
      return column;
    }

    const key = column.key;
    const isLikelyFileColumn = 
      key.includes('url') || 
      key.includes('photo') || 
      key.includes('image') || 
      key.includes('document') || 
      key.includes('file') || 
      key.includes('attachment') ||
      key.includes('logo') ||
      key.includes('doc_url') ||
      key.includes('photo_url') ||
      key.includes('logo_url');

    if (isLikelyFileColumn && data.length > 0) {
      // Check if the data looks like URLs
      const sampleValues = data.slice(0, 5)
        .map(row => row[key])
        .filter(value => value && typeof value === 'string' && value.trim() !== '');
      
      const looksLikeUrls = sampleValues.length > 0 && sampleValues.every(value => 
        typeof value === 'string' && 
        (value.startsWith('http') || value.startsWith('/') || value.includes('.'))
      );

      if (looksLikeUrls) {
        const fileType = sampleValues.length > 0 ? getFileTypeFromUrl(sampleValues[0]) : 'generic';
        return { ...column, isFileColumn: true, fileType };
      }
    }

    return column;
  });
};

const getFileIcon = (fileType: string, size: number = 16) => {
  const iconProps = { size, className: "text-muted-foreground" };
  
  switch (fileType) {
    case 'image':
      return <Image {...iconProps} className="text-blue-600" />;
    case 'document':
      return <FileText {...iconProps} className="text-red-600" />;
    case 'video':
      return <File {...iconProps} className="text-purple-600" />;
    case 'audio':
      return <File {...iconProps} className="text-green-600" />;
    default:
      return <File {...iconProps} />;
  }
};

const getFileName = (url: any): string => {
  if (!url || typeof url !== 'string') return 'file';
  try {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName || 'file';
  } catch (error) {
    return 'file';
  }
};

const getFileSize = (row: any): string | null => {
  // Try common file size field names
  const sizeFields = ['file_size', 'size', 'fileSize', 'doc_size'];
  for (const field of sizeFields) {
    if (row[field]) {
      const size = parseInt(row[field]);
      if (size > 0) {
        return formatFileSize(size);
      }
    }
  }
  return null;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const downloadFile = async (url: string, filename?: string) => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL for download:', url);
    return;
  }
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || getFileName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to opening in new tab
    window.open(url, '_blank');
  }
};

const FileCell: React.FC<{
  url: any;
  fileType: string;
  row: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  showCheckbox: boolean;
}> = ({ url, fileType, row, isSelected, onToggleSelect, showCheckbox }) => {
  const [downloading, setDownloading] = useState(false);
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url || typeof url !== 'string') return;
    
    setDownloading(true);
    try {
      await downloadFile(url, getFileName(url));
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url || typeof url !== 'string') return;
    
    if (fileType === 'image' || fileType === 'document') {
      window.open(url, '_blank');
    }
  };

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return <span className="text-muted-foreground">No file</span>;
  }

  const fileName = getFileName(url);
  const fileSize = getFileSize(row);

  return (
    <div className="flex items-center space-x-2">
      {showCheckbox && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="p-1 h-6 w-6"
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {getFileIcon(fileType)}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate max-w-[150px]" title={fileName}>
            {fileName}
          </div>
          {fileSize && (
            <div className="text-xs text-muted-foreground">{fileSize}</div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {(fileType === 'image' || fileType === 'document') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="p-1 h-6 w-6"
            title="Preview"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="p-1 h-6 w-6"
          title="Download"
        >
          {downloading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
};

const SmartTableHeader: React.FC<{
  column: SmartTableColumn;
  data: any[];
  selectedFiles: Set<string>;
  onToggleAll: () => void;
  onBulkDownload: () => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}> = ({ column, data, selectedFiles, onToggleAll, onBulkDownload, sortField, sortDirection, onSort }) => {
  const [downloading, setDownloading] = useState(false);
  
  const validFiles = column.isFileColumn ? data.filter(row => row[column.key] && typeof row[column.key] === 'string' && row[column.key].trim() !== '').length : 0;
  const allSelected = validFiles > 0 && selectedFiles.size === validFiles;
  const someSelected = selectedFiles.size > 0;
  const isCurrentSortField = sortField === column.key;
  const isSortable = column.sortable !== false && onSort;

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) return;
    
    setDownloading(true);
    try {
      await onBulkDownload();
    } finally {
      setDownloading(false);
    }
  };

  const handleSort = () => {
    if (!isSortable) return;
    
    if (isCurrentSortField) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newDirection);
    } else {
      // Default to ascending for new field
      onSort(column.key, 'asc');
    }
  };

  const getSortIcon = () => {
    if (!isSortable) return null;
    
    if (isCurrentSortField) {
      return sortDirection === 'asc' ? 
        <ArrowUp className="h-4 w-4 ml-1" /> : 
        <ArrowDown className="h-4 w-4 ml-1" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  return (
    <div className="flex items-center space-x-3 min-w-0">
      {/* Column Header with optional sorting */}
      <div 
        className={`flex items-center min-w-0 ${isSortable ? 'cursor-pointer hover:text-foreground' : ''}`}
        onClick={handleSort}
      >
        <span className="truncate">{column.header}</span>
        {getSortIcon()}
      </div>
      
      {/* File column controls */}
      {column.isFileColumn && validFiles > 0 && (
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {validFiles}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAll();
            }}
            className="p-1 h-6 w-6"
            title={allSelected ? "Deselect all files" : "Select all files"}
          >
            {allSelected ? (
              <CheckSquare className="h-3 w-3 text-primary" />
            ) : (
              <Square className="h-3 w-3" />
            )}
          </Button>
          
          {someSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBulkDownload();
              }}
              disabled={downloading}
              className="p-1 h-6 w-6"
              title={`Download ${selectedFiles.size} selected files`}
            >
              {downloading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Archive className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const SmartTable: React.FC<SmartTableProps> = ({
  data,
  columns,
  onRowClick,
  loading = false,
  className = '',
  sortField,
  sortDirection,
  onSort
}) => {
  const [selectedFilesByColumn, setSelectedFilesByColumn] = useState<Record<string, Set<string>>>({});

  // Auto-detect file columns
  const detectedColumns = useMemo(() => detectFileColumns(columns, data), [columns, data]);

  // Initialize selected files state for file columns
  const fileColumns = detectedColumns.filter(col => col.isFileColumn);
  
  const toggleFileSelection = (columnKey: string, fileUrl: string) => {
    setSelectedFilesByColumn(prev => {
      const columnSelected = prev[columnKey] || new Set();
      const newSelected = new Set(columnSelected);
      
      if (newSelected.has(fileUrl)) {
        newSelected.delete(fileUrl);
      } else {
        newSelected.add(fileUrl);
      }
      
      return { ...prev, [columnKey]: newSelected };
    });
  };

  const toggleAllFiles = (columnKey: string) => {
    const validFiles = data
      .map(row => row[columnKey])
      .filter(url => url && typeof url === 'string' && url.trim() !== '');
      
    setSelectedFilesByColumn(prev => {
      const columnSelected = prev[columnKey] || new Set();
      const allSelected = columnSelected.size === validFiles.length;
      
      if (allSelected) {
        return { ...prev, [columnKey]: new Set() };
      } else {
        return { ...prev, [columnKey]: new Set(validFiles) };
      }
    });
  };

  const downloadFilesAsZip = async (columnKey: string) => {
    const selectedFiles = selectedFilesByColumn[columnKey] || new Set();
    if (selectedFiles.size === 0) return;

    // For now, download files individually
    // TODO: Implement ZIP functionality when JSZip is available
    const downloadPromises = Array.from(selectedFiles).map(async (url) => {
      try {
        await downloadFile(url, getFileName(url));
      } catch (error) {
        console.error(`Failed to download ${url}:`, error);
      }
    });

    await Promise.all(downloadPromises);
    
    // Clear selection after download
    setSelectedFilesByColumn(prev => ({ ...prev, [columnKey]: new Set() }));
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {detectedColumns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {detectedColumns.map((column) => (
                  <TableCell key={column.key}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {detectedColumns.map((column) => (
              <TableHead key={column.key} className="p-3">
                <SmartTableHeader
                  column={column}
                  data={data}
                  selectedFiles={selectedFilesByColumn[column.key] || new Set()}
                  onToggleAll={() => toggleAllFiles(column.key)}
                  onBulkDownload={() => downloadFilesAsZip(column.key)}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={detectedColumns.length} 
                className="text-center py-8 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                {detectedColumns.map((column) => (
                  <TableCell key={column.key} className="p-3">
                    {column.isFileColumn ? (
                      <FileCell
                        url={row[column.key]}
                        fileType={column.fileType || 'generic'}
                        row={row}
                        isSelected={(selectedFilesByColumn[column.key] || new Set()).has(row[column.key])}
                        onToggleSelect={() => {
                          if (row[column.key] && typeof row[column.key] === 'string') {
                            toggleFileSelection(column.key, row[column.key]);
                          }
                        }}
                        showCheckbox={!!(row[column.key] && typeof row[column.key] === 'string' && row[column.key].trim() !== '')}
                      />
                    ) : column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      row[column.key]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SmartTable;