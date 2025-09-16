import React, { useState, useMemo } from 'react';
import { SmartTable } from './ui/smart-table';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Download, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface SQLResultsTableProps {
  data: any[];
  title?: string;
  description?: string;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

// Define types for media columns and table columns
interface MediaColumn {
  key: string;
  fileType: string;
  count: number;
}

interface TableColumn {
  key: string;
  header: string;
  isFileColumn?: boolean;
  fileType?: 'image' | 'document' | 'video' | 'audio' | 'generic';
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

// Auto-detect file/media columns based on column names and content
const detectMediaColumns = (data: any[]): MediaColumn[] => {
  if (!data || data.length === 0) return [];
  
  const sampleRow = data[0];
  const mediaColumns: MediaColumn[] = [];
  
  Object.keys(sampleRow).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check column name patterns
    const isMediaColumn = 
      lowerKey.includes('url') ||
      lowerKey.includes('photo') ||
      lowerKey.includes('image') ||
      lowerKey.includes('document') ||
      lowerKey.includes('file') ||
      lowerKey.includes('attachment') ||
      lowerKey.includes('media') ||
      lowerKey.includes('avatar') ||
      lowerKey.includes('picture') ||
      lowerKey.includes('pic') ||
      lowerKey.includes('pdf') ||
      lowerKey.includes('doc') ||
      lowerKey.includes('video') ||
      lowerKey.includes('audio');
    
    if (isMediaColumn) {
      // Check if at least some rows have valid string values for this column
      const hasData = data.some(row => {
        const value = row[key];
        return value && typeof value === 'string' && value.trim() !== '';
      });
      
      if (hasData) {
        // Determine file type based on column name or content
        let fileType = 'generic';
        if (lowerKey.includes('photo') || lowerKey.includes('image') || lowerKey.includes('avatar') || lowerKey.includes('picture') || lowerKey.includes('pic')) {
          fileType = 'image';
        } else if (lowerKey.includes('pdf') || lowerKey.includes('doc') || lowerKey.includes('document')) {
          fileType = 'document';
        } else if (lowerKey.includes('video')) {
          fileType = 'video';
        } else if (lowerKey.includes('audio')) {
          fileType = 'audio';
        }
        
        mediaColumns.push({
          key,
          fileType: fileType as 'image' | 'document' | 'video' | 'audio' | 'generic',
          count: data.filter(row => {
            const value = row[key];
            return value && typeof value === 'string' && value.trim() !== '';
          }).length
        });
      }
    }
  });
  
  return mediaColumns;
};

// Auto-generate table columns from SQL data
const generateColumns = (data: any[], mediaColumns: MediaColumn[]): TableColumn[] => {
  if (!data || data.length === 0) return [];
  
  const sampleRow = data[0];
  const columns: TableColumn[] = [];
  
  Object.keys(sampleRow).forEach(key => {
    const mediaColumn = mediaColumns.find(mc => mc.key === key);
    
    if (mediaColumn) {
      // This is a media column
      columns.push({
        key,
        header: formatColumnHeader(key),
        isFileColumn: true,
        fileType: mediaColumn.fileType as 'image' | 'document' | 'video' | 'audio' | 'generic',
        sortable: false
      });
    } else {
      // Regular column
      columns.push({
        key,
        header: formatColumnHeader(key),
        sortable: true,
        render: (value: any, row: any) => {
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground italic">null</span>;
          }
          
          if (typeof value === 'boolean') {
            return (
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'true' : 'false'}
              </Badge>
            );
          }
          
          if (typeof value === 'object') {
            return (
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {JSON.stringify(value)}
              </code>
            );
          }
          
          // Truncate long strings
          const stringValue = String(value);
          if (stringValue.length > 50) {
            return (
              <span title={stringValue}>
                {stringValue.substring(0, 47)}...
              </span>
            );
          }
          
          return stringValue;
        }
      });
    }
  });
  
  return columns;
};

// Format column headers (convert snake_case to Title Case)
const formatColumnHeader = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const SQLResultsTable: React.FC<SQLResultsTableProps> = ({ data, title = "Query Results", description, loading = false, onRefresh, className }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Detect media columns and generate table columns
  const { mediaColumns, columns } = useMemo(() => {
    const detectedMedia = detectMediaColumns(data);
    const generatedColumns = generateColumns(data, detectedMedia);
    
    return {
      mediaColumns: detectedMedia,
      columns: generatedColumns
    };
  }, [data]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !data) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const totalMediaFiles = mediaColumns.reduce((sum, col) => sum + col.count, 0);

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
    <Card className={`${className} ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Media Summary */}
            {totalMediaFiles > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Download className="h-3 w-3" />
                  {totalMediaFiles} files
                </Badge>
                {mediaColumns.map(col => (
                  <Badge key={col.key} variant="outline" className="text-xs">
                    {col.count} {col.fileType}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Full Screen Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="gap-2"
                title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                {isFullScreen ? 'Exit' : 'Full Screen'}
              </Button>
              
              {/* Refresh Button */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Data Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{data?.length || 0} records</span>
          {columns.length > 0 && <span>{columns.length} columns</span>}
          {mediaColumns.length > 0 && <span>{mediaColumns.length} media columns</span>}
        </div>
      </CardHeader>
      
      <CardContent className={`${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>
        {data && data.length > 0 ? (
          <div className={`overflow-auto ${isFullScreen ? 'h-full' : 'max-w-full'}`} style={{ maxHeight: isFullScreen ? 'none' : '70vh' }}>
            <div className="min-w-full">
              <SmartTable
                data={sortedData}
                columns={columns}
                loading={loading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onRowClick={(row) => {
                  console.log('Row clicked:', row);
                  // You can add row click handling here
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading data...
              </div>
            ) : (
              'No data to display'
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default SQLResultsTable;