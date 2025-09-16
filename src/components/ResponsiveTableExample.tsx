import React, { useState, useMemo } from 'react';
import ResponsiveTable from './ResponsiveTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';

// Example usage of ResponsiveTable with 23+ columns
const ResponsiveTableExample = () => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sample data with 23+ columns
  const sampleData = Array.from({ length: 50 }, (_, index) => ({
    id: `ID-${index + 1}`,
    name: `Person ${index + 1}`,
    email: `person${index + 1}@example.com`,
    phone: `+256-${Math.floor(Math.random() * 900000000) + 100000000}`,
    age: Math.floor(Math.random() * 40) + 20,
    department: ['HR', 'IT', 'Finance', 'Operations'][Math.floor(Math.random() * 4)],
    position: ['Manager', 'Developer', 'Analyst', 'Coordinator'][Math.floor(Math.random() * 4)],
    salary: Math.floor(Math.random() * 50000) + 30000,
    startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
    country: ['Uganda', 'Kenya', 'Tanzania'][Math.floor(Math.random() * 3)],
    city: ['Kampala', 'Nairobi', 'Dar es Salaam'][Math.floor(Math.random() * 3)],
    address: `${Math.floor(Math.random() * 999) + 1} Street Name`,
    emergencyContact: `+256-${Math.floor(Math.random() * 900000000) + 100000000}`,
    skills: ['JavaScript', 'React', 'Node.js', 'Python'][Math.floor(Math.random() * 4)],
    experience: Math.floor(Math.random() * 10) + 1,
    education: ['Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 3)],
    certifications: Math.floor(Math.random() * 5),
    projects: Math.floor(Math.random() * 20) + 1,
    performance: Math.floor(Math.random() * 5) + 1,
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: `Sample note for person ${index + 1}`,
    manager: `Manager ${Math.floor(Math.random() * 10) + 1}`,
    team: `Team ${Math.floor(Math.random() * 5) + 1}`,
  }));

  // Define columns with sticky configuration
  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      sortable: true,
      sticky: 'left' as const,
      render: (value: string) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'name',
      header: 'Full Name',
      width: '200px',
      sortable: true,
      sticky: 'left' as const,
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      width: '250px',
      sortable: true,
      render: (value: string) => (
        <div className="text-blue-600 hover:underline cursor-pointer">{value}</div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '150px',
      sortable: true
    },
    {
      key: 'age',
      header: 'Age',
      width: '80px',
      sortable: true,
      render: (value: number) => (
        <Badge variant={value > 30 ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'department',
      header: 'Department',
      width: '120px',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'position',
      header: 'Position',
      width: '150px',
      sortable: true
    },
    {
      key: 'salary',
      header: 'Salary (UGX)',
      width: '120px',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-green-600">
          {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'startDate',
      header: 'Start Date',
      width: '120px',
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'Active' ? 'default' : value === 'Pending' ? 'secondary' : 'destructive'}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'country',
      header: 'Country',
      width: '120px',
      sortable: true
    },
    {
      key: 'city',
      header: 'City',
      width: '120px',
      sortable: true
    },
    {
      key: 'address',
      header: 'Address',
      width: '200px',
      sortable: true
    },
    {
      key: 'emergencyContact',
      header: 'Emergency Contact',
      width: '150px',
      sortable: true
    },
    {
      key: 'skills',
      header: 'Primary Skill',
      width: '120px',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'experience',
      header: 'Experience (Years)',
      width: '130px',
      sortable: true,
      render: (value: number) => (
        <div className="text-center font-medium">{value}</div>
      )
    },
    {
      key: 'education',
      header: 'Education',
      width: '120px',
      sortable: true
    },
    {
      key: 'certifications',
      header: 'Certifications',
      width: '120px',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">{value}</div>
      )
    },
    {
      key: 'projects',
      header: 'Projects',
      width: '100px',
      sortable: true,
      render: (value: number) => (
        <div className="text-center font-medium">{value}</div>
      )
    },
    {
      key: 'performance',
      header: 'Performance',
      width: '120px',
      sortable: true,
      render: (value: number) => (
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < value ? 'text-yellow-500' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      width: '120px',
      sortable: true
    },
    {
      key: 'manager',
      header: 'Manager',
      width: '150px',
      sortable: true
    },
    {
      key: 'team',
      header: 'Team',
      width: '100px',
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      sticky: 'right' as const,
      render: (value: any, row: any) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View:', row.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit:', row.id);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete:', row.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortField) return sampleData;
    
    return [...sampleData].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sampleData, sortField, sortDirection]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Responsive Table Example</h1>
        <p className="text-muted-foreground">
          This table demonstrates 23+ columns with horizontal scrolling, sticky columns, and fullscreen toggle.
        </p>
      </div>

      <ResponsiveTable
        data={sortedData}
        columns={columns}
        title="Employee Management System"
        onRowClick={handleRowClick}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        stickyColumns={{
          left: ['id', 'name'],
          right: ['actions']
        }}
        className="w-full"
      />

      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✅ 23+ columns with horizontal scrolling</li>
          <li>✅ Sticky columns (ID, Name on left; Actions on right)</li>
          <li>✅ Fullscreen toggle button (double-arrow icon)</li>
          <li>✅ Sortable columns with visual indicators</li>
          <li>✅ Custom cell rendering (badges, buttons, ratings)</li>
          <li>✅ Responsive design for all screen sizes</li>
          <li>✅ Row click handling</li>
          <li>✅ Container-constrained layout (no page enlargement)</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponsiveTableExample;
