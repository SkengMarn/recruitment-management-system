import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import SmartTable from './ui/smart-table';

const SmartTableDemo = () => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [fullscreenType, setFullscreenType] = useState<boolean | string>(true);
  
  // Sample data with file columns
  const sampleData = [
    {
      id: 1,
      name: 'Agnes Nakimuli',
      photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      doc_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      email: 'agnes@example.com',
      file_size: 2547123,
      mime_type: 'application/pdf',
      status: 'active'
    },
    {
      id: 2,
      name: 'James Otim',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      doc_url: 'https://www.africau.edu/images/default/sample.pdf',
      email: 'james@example.com',
      file_size: 1234567,
      mime_type: 'application/pdf',
      status: 'inactive'
    },
    {
      id: 3,
      name: 'Grace Wanjiku',
      photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      doc_url: 'https://www.clickdimensions.com/links/TestPDFfile.pdf',
      email: 'grace@example.com',
      file_size: 3456789,
      mime_type: 'application/pdf',
      status: 'active'
    }
  ];

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleShowFullscreen = (breakpoint: boolean | string) => {
    setFullscreenType(breakpoint);
    setShowFullscreenModal(true);
  };

  const sortedData = [...sampleData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const fullscreenValues = [true, 'sm-down', 'md-down', 'lg-down', 'xl-down', 'xxl-down'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Table Demo</CardTitle>
          <CardDescription>
            Demonstrates automatic file detection and download functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Fullscreen Modal Test Section */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-3">Fullscreen Modal Test:</h3>
              <div className="flex flex-wrap gap-2">
                {fullscreenValues.map((v, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShowFullscreen(v)}
                  >
                    Full screen
                    {typeof v === 'string' && ` below ${v.split('-')[0]}`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Features Demonstrated:</h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• <strong>Auto-detection:</strong> Columns with 'url', 'photo', 'image', 'document', 'file' are detected as file columns</li>
                <li>• <strong>Smart headers:</strong> Column names, sorting, and file controls are grouped together for clarity</li>
                <li>• <strong>Sorting:</strong> Click column headers to sort data (arrows indicate sort direction)</li>
                <li>• <strong>Individual downloads:</strong> Click the download icon to download individual files</li>
                <li>• <strong>Bulk selection:</strong> Use checkboxes to select multiple files from the same column</li>
                <li>• <strong>Bulk download:</strong> Click the archive icon in the column header to download selected files</li>
                <li>• <strong>File previews:</strong> Click the eye icon to preview images and documents</li>
                <li>• <strong>File metadata:</strong> Shows file sizes and types when available</li>
              </ul>
            </div>

            <SmartTable
              data={sortedData}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  sortable: true,
                  render: (value) => <div className="font-medium">{value}</div>
                },
                {
                  key: 'photo_url',
                  header: 'Profile Photo',
                  isFileColumn: true,
                  fileType: 'image',
                  sortable: false
                },
                {
                  key: 'doc_url', 
                  header: 'Documents',
                  isFileColumn: true,
                  fileType: 'document',
                  sortable: false
                },
                {
                  key: 'email',
                  header: 'Email',
                  sortable: true
                },
                {
                  key: 'status',
                  header: 'Status',
                  sortable: true,
                  render: (value) => (
                    <span className={`px-2 py-1 rounded text-xs ${
                      value === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {value}
                    </span>
                  )
                }
              ]}
              onRowClick={(row) => {
                console.log('Row clicked:', row);
              }}
            />

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900">Try it out:</h3>
              <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                <li>1. <strong>Sorting:</strong> Click "Name", "Email", or "Status" headers to sort the table</li>
                <li>2. <strong>File Controls:</strong> Notice how file column headers show the file count, select all, and download buttons grouped together</li>
                <li>3. <strong>Individual Downloads:</strong> Click the download button next to any file</li>
                <li>4. <strong>Bulk Selection:</strong> Use checkboxes to select files, then click the archive icon in the header</li>
                <li>5. <strong>File Preview:</strong> Click the eye icon to preview files (opens in new tab)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreenModal && (
        <div 
          className="fixed inset-0 z-50 bg-white flex flex-col"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0
          }}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold">
              Fullscreen Modal Test
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Testing fullscreen modal functionality - Type: {typeof fullscreenType === 'boolean' ? 'true fullscreen' : `below ${fullscreenType.split('-')[0]}`}
            </p>
          </div>
          
          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="container-fluid h-full">
              {/* 2x2 Grid Layout */}
              <div className="grid grid-cols-2 gap-6 h-full">
                
                {/* Top Left - Section 1 */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" className="w-full px-3 py-2 border rounded-md" placeholder="john.doe@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      <input type="date" className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input type="tel" className="w-full px-3 py-2 border rounded-md" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                {/* Top Right - Section 2 */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Address Line 1</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="123 Main Street" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address Line 2</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Apt 4B" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="New York" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <select className="w-full px-3 py-2 border rounded-md">
                          <option>Select State</option>
                          <option>New York</option>
                          <option>California</option>
                          <option>Texas</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="10001" />
                    </div>
                  </div>
                </div>

                {/* Bottom Left - Section 3 */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Employment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Job Title</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Tech Corp Inc." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input type="date" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Salary</label>
                        <input type="number" className="w-full px-3 py-2 border rounded-md" placeholder="75000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Department</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>Select Department</option>
                        <option>Engineering</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                        <option>HR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Right - Section 4 */}
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Phone</label>
                      <input type="tel" className="w-full px-3 py-2 border rounded-md" placeholder="+1 (555) 987-6543" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Skills</label>
                      <select multiple className="w-full px-3 py-2 border rounded-md" size={3}>
                        <option>JavaScript</option>
                        <option>Python</option>
                        <option>React</option>
                        <option>Node.js</option>
                        <option>SQL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea 
                        className="w-full px-3 py-2 border rounded-md" 
                        rows={3}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setShowFullscreenModal(false)}
            >
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTableDemo;