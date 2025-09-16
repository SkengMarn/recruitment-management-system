import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Maximize2, Minimize2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ResponsiveTableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  sticky?: 'left' | 'right' | false;
  width?: string;
  minWidth?: string;
}

interface ResponsiveTableProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  title?: string;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  className?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  stickyColumns?: {
    left?: string[];
    right?: string[];
  };
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  title,
  onRowClick,
  loading = false,
  className = '',
  sortField,
  sortDirection,
  onSort,
  stickyColumns = {}
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Calculate sticky column positions
  const getStickyStyle = (column: ResponsiveTableColumn, index: number) => {
    const isLeftSticky = stickyColumns.left?.includes(column.key);
    const isRightSticky = stickyColumns.right?.includes(column.key);
    
    if (isLeftSticky) {
      const leftOffset = columns
        .slice(0, index)
        .filter(col => stickyColumns.left?.includes(col.key))
        .reduce((acc, col) => acc + (parseInt(col.width || '120') || 120), 0);
      
      return {
        position: 'sticky' as const,
        left: `${leftOffset}px`,
        zIndex: 10,
        backgroundColor: 'var(--background)',
        borderRight: '1px solid var(--border)'
      };
    }
    
    if (isRightSticky) {
      const rightOffset = columns
        .slice(index + 1)
        .filter(col => stickyColumns.right?.includes(col.key))
        .reduce((acc, col) => acc + (parseInt(col.width || '120') || 120), 0);
      
      return {
        position: 'sticky' as const,
        right: `${rightOffset}px`,
        zIndex: 10,
        backgroundColor: 'var(--background)',
        borderLeft: '1px solid var(--border)'
      };
    }
    
    return {};
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortField === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortField !== columnKey) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const containerClasses = `
    ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}
    ${className}
  `;

  const cardClasses = `
    ${isFullScreen ? 'h-full flex flex-col' : ''}
    border rounded-lg
  `;

  const tableContainerClasses = `
    ${isFullScreen ? 'flex-1 overflow-hidden' : 'max-h-[70vh]'}
    overflow-auto
    border rounded-md
  `;

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        {title && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
          </CardHeader>
        )}
        
        <CardContent className={isFullScreen ? 'flex-1 overflow-hidden p-6' : 'p-6'}>
          <div className={tableContainerClasses}>
            <Table className="relative">
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => {
                    const stickyStyle = getStickyStyle(column, index);
                    
                    return (
                      <TableHead
                        key={column.key}
                        className={`
                          ${column.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}
                          ${stickyStyle.position ? 'bg-background' : ''}
                        `}
                        style={{
                          ...stickyStyle,
                          width: column.width,
                          minWidth: column.minWidth || column.width || '120px'
                        }}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.header}
                          {column.sortable && getSortIcon(column.key)}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column, colIndex) => {
                        const stickyStyle = getStickyStyle(column, colIndex);
                        const cellValue = row[column.key];
                        
                        return (
                          <TableCell
                            key={column.key}
                            className={stickyStyle.position ? 'bg-background' : ''}
                            style={{
                              ...stickyStyle,
                              width: column.width,
                              minWidth: column.minWidth || column.width || '120px'
                            }}
                          >
                            {column.render ? column.render(cellValue, row) : cellValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && data.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {data.length} records • {columns.length} columns
              {isFullScreen && (
                <span className="ml-2 text-blue-600">• Full screen mode</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveTable;
