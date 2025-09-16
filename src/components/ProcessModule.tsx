import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Stethoscope,
  GraduationCap,
  CreditCard,
  Plane
} from 'lucide-react';
import { apiClient } from '../utils/supabase/client';

const ProcessModule = () => {
  const [processData, setProcessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState('passport');

  useEffect(() => {
    fetchProcessData();
  }, []);

  const fetchProcessData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch candidates data only (remove non-existent getStageHistory call)
      const candidatesData = await apiClient.getCandidates();
      
      // Group candidates by their current stage using correct enum values
      const processDataByStage = {
        passport: [],
        interview: [],
        medical: [],
        training: [],
        visa: [],
        deployment: []
      };
      
      // Process candidates and group by stage
      candidatesData.candidates?.forEach(candidate => {
        const stage = candidate.stage || 'passport';
        if (processDataByStage[stage]) {
          processDataByStage[stage].push({
            id: candidate.id,
            name: candidate.full_name || candidate.name,
            position: candidate.position || 'Not specified',
            application_date: candidate.created_at?.split('T')[0] || 'Unknown',
            deployment_date: candidate.deployment_date,
            stage: candidate.stage
          });
        }
      });
      
      setProcessData(processDataByStage);
    } catch (err) {
      console.error('Failed to fetch process data:', err);
      setError('Failed to load process tracking data');
    } finally {
      setLoading(false);
    }
  };

  const processStages = [
    {
      id: 'passport',
      name: 'Passport Collection',
      description: 'Collecting and verifying passport documents',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      id: 'interview',
      name: 'Interview',
      description: 'Candidate interview and assessment',
      icon: Users,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      id: 'medical',
      name: 'Medical Examination',
      description: 'Medical checkup and health verification',
      icon: Stethoscope,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'training',
      name: 'Training',
      description: 'Skills training and preparation',
      icon: GraduationCap,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      iconColor: 'text-orange-600'
    },
    {
      id: 'visa',
      name: 'Visa Processing',
      description: 'Visa application and processing',
      icon: CreditCard,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'deployment',
      name: 'Deployment',
      description: 'Final deployment and travel arrangements',
      icon: Plane,
      color: 'bg-green-50 border-green-200 text-green-700',
      iconColor: 'text-green-600'
    }
  ];

  const calculateTotalCandidates = () => {
    if (!processData) return 0;
    return Object.values(processData).reduce((sum: number, candidates: any) => sum + (candidates?.length || 0), 0);
  };

  const calculateStagePercentage = (stageId) => {
    const totalCandidates = calculateTotalCandidates();
    if (totalCandidates === 0) return 0;
    const stageCandidates = processData[stageId]?.length || 0;
    return Math.round((stageCandidates / totalCandidates) * 100);
  };

  const getAverageProcessingTime = () => {
    // This would typically come from the backend calculation
    return '52 days';
  };

  const getBottleneckStage = () => {
    if (!processData) return null;
    let maxCandidates = 0;
    let bottleneckStage: any = null;
    
    Object.entries(processData).forEach(([stageId, candidates]: [string, any]) => {
      if (stageId !== 'deployed' && (candidates?.length || 0) > maxCandidates) {
        maxCandidates = candidates?.length || 0;
        bottleneckStage = processStages.find(stage => stage.id === stageId);
      }
    });
    
    return bottleneckStage;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading process data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
              <Button onClick={fetchProcessData} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bottleneck = getBottleneckStage();
  const totalCandidates = calculateTotalCandidates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Process Tracking</CardTitle>
              <CardDescription className="mt-1">
                Monitor candidate flow through the recruitment pipeline
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchProcessData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Process Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total in Pipeline</p>
                <p className="text-2xl font-semibold">{totalCandidates}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successfully Deployed</p>
                <p className="text-2xl font-semibold text-green-600">
                  {processData?.deployed?.length || 0}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-semibold">{getAverageProcessingTime()}</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Bottleneck</p>
                <p className="text-lg font-semibold text-red-600">
                  {bottleneck ? bottleneck.name : 'None'}
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Process Flow Pipeline</CardTitle>
          <CardDescription>
            Visual representation of candidates moving through each stage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {processStages.map((stage, index) => {
              const candidateCount = processData[stage.id]?.length || 0;
              const percentage = calculateStagePercentage(stage.id);
              const IconComponent = stage.icon;
              
              return (
                <div key={stage.id} className="relative">
                  <div 
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedStage === stage.id 
                        ? stage.color + ' border-current shadow-md' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center ${
                          selectedStage === stage.id ? 'border-current' : 'border-gray-300'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${
                            selectedStage === stage.id ? stage.iconColor : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            selectedStage === stage.id ? 'text-current' : 'text-gray-900'
                          }`}>
                            {stage.name}
                          </h3>
                          <p className={`text-sm ${
                            selectedStage === stage.id ? 'text-current opacity-80' : 'text-muted-foreground'
                          }`}>
                            {stage.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            selectedStage === stage.id ? 'text-current' : 'text-gray-900'
                          }`}>
                            {candidateCount}
                          </div>
                          <div className={`text-xs ${
                            selectedStage === stage.id ? 'text-current opacity-70' : 'text-muted-foreground'
                          }`}>
                            candidates
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-semibold ${
                            selectedStage === stage.id ? 'text-current' : 'text-gray-700'
                          }`}>
                            {percentage}%
                          </div>
                          <div className={`text-xs ${
                            selectedStage === stage.id ? 'text-current opacity-70' : 'text-muted-foreground'
                          }`}>
                            of total
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={selectedStage === stage.id ? 'border-current' : ''}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${
                          selectedStage === stage.id ? 'opacity-100' : 'opacity-50'
                        }`} 
                      />
                    </div>
                  </div>
                  
                  {/* Connection arrow */}
                  {index < processStages.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {processStages.find(s => s.id === selectedStage)?.name} Details
          </CardTitle>
          <CardDescription>
            Candidates currently in this stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageDetails 
            stageId={selectedStage} 
            candidates={processData[selectedStage] || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

const StageDetails = ({ stageId, candidates }) => {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">No candidates in this stage</div>
        <p className="text-sm text-muted-foreground">
          All candidates have moved to the next stage or this stage is currently empty.
        </p>
      </div>
    );
  }

  const getStageSpecificInfo = (candidate) => {
    switch (stageId) {
      case 'pre_registration':
        return {
          status: 'Documentation collection in progress',
          nextStep: 'Complete medical examination scheduling',
          timeInStage: '3 days'
        };
      case 'medical_pending':
        return {
          status: 'Medical examination scheduled',
          nextStep: 'Complete health screening',
          timeInStage: '7 days'
        };
      case 'training':
        return {
          status: 'Skills training in progress',
          nextStep: 'Complete certification program',
          timeInStage: '21 days'
        };
      case 'visa_processing':
        return {
          status: 'Visa application submitted',
          nextStep: 'Await visa approval',
          timeInStage: '14 days'
        };
      case 'deployment_ready':
        return {
          status: 'Ready for deployment',
          nextStep: 'Travel arrangements',
          timeInStage: '2 days'
        };
      case 'deployed':
        return {
          status: 'Successfully deployed',
          nextStep: 'Follow-up and support',
          timeInStage: candidate.deployment_date ? 
            `Deployed on ${candidate.deployment_date}` : 'Recently deployed'
        };
      default:
        return {
          status: 'In progress',
          nextStep: 'Processing',
          timeInStage: 'Unknown'
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.slice(0, 12).map((candidate) => {
          const stageInfo = getStageSpecificInfo(candidate);
          return (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {candidate.id}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {candidate.position}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{stageInfo.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time in stage:</span>
                    <span>{stageInfo.timeInStage}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-muted-foreground mb-1">Next step:</div>
                    <div className="text-sm font-medium text-primary">
                      {stageInfo.nextStep}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Applied: {candidate.application_date}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {candidates.length > 12 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            View All {candidates.length} Candidates
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProcessModule;