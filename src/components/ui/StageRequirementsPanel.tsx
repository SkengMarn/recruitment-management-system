import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { CheckCircle, XCircle, AlertCircle, FileText, User } from 'lucide-react';
import { StageValidator, STAGE_VALIDATION_RULES } from '../../utils/stageValidation';

interface StageRequirementsPanelProps {
  candidateData: any;
  documents: any[];
  currentStage: string;
}

const StageRequirementsPanel: React.FC<StageRequirementsPanelProps> = ({
  candidateData,
  documents,
  currentStage
}) => {
  const stageRule = StageValidator.getStageRule(currentStage);
  
  if (!stageRule) {
    return null;
  }

  const fieldValidation = StageValidator.validateStageRequirements(candidateData, currentStage);
  const candidateDocuments = documents.filter(doc => 
    doc.candidate_id === candidateData.id && 
    (doc.status === 'verified' || doc.is_verified === true || doc.is_verified === 1)
  );

  const getRequirementStatus = (requirement: any) => {
    const value = candidateData[requirement.field];
    const isValid = requirement.required ? (value && value !== '') : true;
    
    if (requirement.validator && value && !requirement.validator(value)) {
      return 'invalid';
    }
    
    return isValid ? 'complete' : 'missing';
  };

  const getDocumentStatus = (docReq: any) => {
    const hasDocument = candidateDocuments.some(doc => 
      (doc.type || doc.doc_type || doc.document_type) === docReq.type
    );
    return hasDocument ? 'complete' : 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'invalid':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = StageValidator.getStageProgress(currentStage);
  const nextStages = StageValidator.getNextAllowedStages(currentStage);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Stage Requirements: {stageRule.label}
          </div>
          <Badge variant="outline" className="ml-2">
            {Math.round(progress)}% Complete
          </Badge>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Field Requirements */}
        {stageRule.requirements.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-1" />
              Required Information
            </h4>
            <div className="space-y-2">
              {stageRule.requirements.map((req, index) => {
                const status = getRequirementStatus(req);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span className="ml-2 text-sm">{req.label}</span>
                      {req.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <Badge className={getStatusColor(status)} variant="outline">
                      {status === 'complete' ? 'Complete' : status === 'invalid' ? 'Invalid' : 'Missing'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Document Requirements */}
        {stageRule.documentRequirements.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Required Documents
            </h4>
            <div className="space-y-2">
              {stageRule.documentRequirements.map((docReq, index) => {
                const status = getDocumentStatus(docReq);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span className="ml-2 text-sm">{docReq.label}</span>
                      {docReq.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <Badge className={getStatusColor(status)} variant="outline">
                      {status === 'complete' ? 'Uploaded' : 'Missing'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Stages */}
        {nextStages.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Next Available Stages</h4>
            <div className="flex flex-wrap gap-2">
              {nextStages.map(stage => (
                <Badge key={stage} variant="secondary">
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stage Description */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600">
            {StageValidator.getStageDescription(currentStage)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageRequirementsPanel;
