import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const CandidatesModuleTest = () => {
  console.log('CandidatesModuleTest rendering...');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Candidates Management</h1>
        <p className="text-muted-foreground mt-1">
          Test version - if you can see this, the basic component works
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test to verify the component renders correctly.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesModuleTest;
