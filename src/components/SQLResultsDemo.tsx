import React, { useState } from 'react';
import SQLResultsTable from './SQLResultsTable';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Play, Code, Database } from 'lucide-react';

const SQLResultsDemo = () => {
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState('candidates');

  // Sample SQL-like data sets
  const sampleDataSets = {
    candidates: [
      {
        id: 1,
        full_name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+256701234567',
        age: 28,
        nationality: 'Ugandan',
        stage: 'documents_submitted',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        passport_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        cv_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        investment_amount: 2469000,
        service_charge: 100000,
        application_date: '2024-01-15',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        full_name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+256702345678',
        age: 25,
        nationality: 'Kenyan',
        stage: 'deployed',
        photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        passport_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        cv_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        medical_certificate_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        investment_amount: 2469000,
        service_charge: 100000,
        application_date: '2024-01-20',
        created_at: '2024-01-20T14:15:00Z'
      },
      {
        id: 3,
        full_name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+256703456789',
        age: 30,
        nationality: 'Tanzanian',
        stage: 'training',
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        passport_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        investment_amount: 2469000,
        service_charge: 100000,
        application_date: '2024-02-01',
        created_at: '2024-02-01T09:00:00Z'
      }
    ],
    
    documents: [
      {
        id: 1,
        candidate_name: 'John Doe',
        document_type: 'Passport',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        upload_date: '2024-01-15',
        status: 'approved',
        file_size: 2048576,
        is_verified: true
      },
      {
        id: 2,
        candidate_name: 'Jane Smith',
        document_type: 'Medical Certificate',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        upload_date: '2024-01-20',
        status: 'pending_review',
        file_size: 1536000,
        is_verified: false
      },
      {
        id: 3,
        candidate_name: 'David Wilson',
        document_type: 'CV',
        document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        upload_date: '2024-02-01',
        status: 'approved',
        file_size: 3072000,
        is_verified: true
      }
    ],
    
    agents: [
      {
        id: 1,
        agent_name: 'Sarah Johnson',
        email: 'sarah@jawal.com',
        phone: '+256704567890',
        region: 'Central',
        profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        license_document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        total_candidates: 45,
        commission_rate: 0.15,
        is_active: true,
        joined_date: '2023-06-15'
      },
      {
        id: 2,
        agent_name: 'Michael Brown',
        email: 'michael@jawal.com',
        phone: '+256705678901',
        region: 'Western',
        profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        license_document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        contract_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        total_candidates: 32,
        commission_rate: 0.12,
        is_active: true,
        joined_date: '2023-08-20'
      }
    ]
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const currentDataSet = sampleDataSets[currentData];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">SQL Results Table Demo</h1>
        <p className="text-muted-foreground">
          Automatically detects and handles media columns in SQL query results with bulk download capabilities.
        </p>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <Code className="h-5 w-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Usage:</h4>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono">
              <div>{'import SQLResultsTable from "./components/SQLResultsTable";'}</div>
              <div className="mt-2">{'<SQLResultsTable'}</div>
              <div>{'  data={sqlQueryResults}'}</div>
              <div>{'  title="Your Table Title"'}</div>
              <div>{'  description="Optional description"'}</div>
              <div>{'  onRefresh={() => refetchData()}'}</div>
              <div>{'/>'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Auto-Detection Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• <strong>Media Columns:</strong> Automatically detects columns with 'url', 'photo', 'image', 'document', 'file', etc.</li>
              <li>• <strong>File Types:</strong> Determines if files are images, documents, videos, or audio</li>
              <li>• <strong>Bulk Downloads:</strong> Provides select-all and bulk download for each media column</li>
              <li>• <strong>Data Formatting:</strong> Formats currencies, dates, booleans, and long text automatically</li>
              <li>• <strong>Smart Headers:</strong> Converts snake_case to Title Case</li>
              <li>• <strong>Sorting:</strong> All non-media columns are sortable by default</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Set Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data Sets</CardTitle>
          <CardDescription>
            Choose a sample data set to see the automatic media detection in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(sampleDataSets).map(([key, data]) => (
              <Button
                key={key}
                variant={currentData === key ? "default" : "outline"}
                onClick={() => setCurrentData(key)}
                className="capitalize"
              >
                <Database className="h-4 w-4 mr-2" />
                {key} ({data.length} records)
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center gap-2">
            <Play className="h-5 w-5" />
            Interactive Demo
          </CardTitle>
          <CardDescription>
            Try the bulk download features on the media columns below:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="mb-4 text-sm text-yellow-800 space-y-1">
            <li>1. <strong>Media Detection:</strong> Notice how columns with 'url', 'photo', 'image', 'document' are automatically detected</li>
            <li>2. <strong>File Counts:</strong> Each media column shows the number of files available</li>
            <li>3. <strong>Individual Downloads:</strong> Click download buttons next to individual files</li>
            <li>4. <strong>Bulk Selection:</strong> Use checkboxes to select multiple files from the same column</li>
            <li>5. <strong>Bulk Download:</strong> Use the archive icon in media column headers for ZIP downloads</li>
            <li>6. <strong>Sorting:</strong> Click any non-media column header to sort the data</li>
          </ul>
        </CardContent>
      </Card>

      {/* SQL Results Table */}
      <SQLResultsTable
        data={currentDataSet}
        title={`${currentData.charAt(0).toUpperCase() + currentData.slice(1)} Data`}
        description={`Sample ${currentData} data showing automatic media column detection and bulk download capabilities`}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Usage Stats */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              Auto-Detected Features
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-green-800">Media Columns</div>
              <div className="text-green-700">
                Columns containing 'url', 'photo', 'image', 'document', 'file'
              </div>
            </div>
            <div>
              <div className="font-medium text-green-800">File Type Detection</div>
              <div className="text-green-700">
                Automatic classification as image, document, video, or audio
              </div>
            </div>
            <div>
              <div className="font-medium text-green-800">Data Formatting</div>
              <div className="text-green-700">
                Currency, dates, booleans, and long text handled automatically
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SQLResultsDemo;