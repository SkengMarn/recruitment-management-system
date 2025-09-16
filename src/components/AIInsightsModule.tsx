import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Globe,
  BarChart3,
  Zap,
  MessageCircle,
  Lightbulb,
  Rocket,
  Shield,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Play,
  Pause,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';

const AIInsightsModule = () => {
  const [aiAssistantActive, setAiAssistantActive] = useState(true);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [aiMetrics, setAiMetrics] = useState({
    predictionAccuracy: 94.7,
    insightsGenerated: 1247,
    actionsRecommended: 456,
    decisionsOptimized: 189,
    costSavings: 890000,
    efficiencyGain: 23.5
  });

  const aiInsights = [
    {
      id: 1,
      type: 'market_trend',
      title: 'UAE Healthcare Demand Surge Predicted',
      description: 'AI models predict 35% increase in healthcare worker demand in UAE over next 6 months',
      confidence: 92,
      impact: 'high',
      category: 'Market Intelligence',
      timeframe: 'Next 6 months',
      action: 'Increase healthcare recruitment by 40%',
      potentialRevenue: 4500000,
      status: 'new'
    },
    {
      id: 2,
      type: 'optimization',
      title: 'Agent Performance Pattern Identified',
      description: 'Top-performing agents share common training characteristics that can be replicated',
      confidence: 87,
      impact: 'medium',
      category: 'Performance Optimization',
      timeframe: 'Immediate',
      action: 'Update agent training program',
      potentialRevenue: 1200000,
      status: 'actionable'
    },
    {
      id: 3,
      type: 'risk_alert',
      title: 'Regulatory Change Risk in Saudi Arabia',
      description: 'AI detected signals indicating potential visa policy changes in Saudi healthcare sector',
      confidence: 78,
      impact: 'high',
      category: 'Risk Management',
      timeframe: 'Next 90 days',
      action: 'Prepare compliance documentation',
      potentialRevenue: -850000,
      status: 'urgent'
    },
    {
      id: 4,
      type: 'opportunity',
      title: 'Untapped Market: Qatar Construction',
      description: 'AI analysis reveals significant opportunity in Qatar construction sector with 67% higher margins',
      confidence: 89,
      impact: 'high',
      category: 'Market Expansion',
      timeframe: 'Next 3 months',
      action: 'Launch Qatar construction recruitment',
      potentialRevenue: 2300000,
      status: 'recommended'
    }
  ];

  const aiPredictions = [
    {
      metric: 'Monthly Placements',
      current: 2847,
      predicted: 3456,
      change: 21.4,
      timeframe: 'Next Month',
      accuracy: 94,
      factors: ['Seasonal demand', 'Market expansion', 'Agent growth']
    },
    {
      metric: 'Average Processing Time',
      current: 52,
      predicted: 38,
      change: -26.9,
      timeframe: 'Next Quarter',
      accuracy: 89,
      factors: ['Process automation', 'AI verification', 'Digital documents']
    },
    {
      metric: 'Revenue Growth',
      current: 2400000,
      predicted: 3100000,
      change: 29.2,
      timeframe: 'Next Quarter',
      accuracy: 91,
      factors: ['Market expansion', 'Premium services', 'Efficiency gains']
    },
    {
      metric: 'Success Rate',
      current: 94.7,
      predicted: 97.2,
      change: 2.6,
      timeframe: 'Next 6 Months',
      accuracy: 88,
      factors: ['Better matching', 'Enhanced training', 'Quality control']
    }
  ];

  const aiRecommendations = [
    {
      id: 1,
      title: 'Optimize Agent Training Program',
      description: 'AI analysis shows that agents with specific training modules have 34% higher success rates',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      timeline: '2-4 weeks',
      resources: ['Training team', 'Content development', 'Platform updates'],
      expectedOutcome: 'Increase overall success rate by 8-12%',
      costSavings: 450000,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Implement Predictive Candidate Matching',
      description: 'Deploy ML algorithms to match candidates with employers based on success probability',
      priority: 'high',
      effort: 'high',
      impact: 'very_high',
      timeline: '6-8 weeks',
      resources: ['Data science team', 'Engineering resources', 'ML infrastructure'],
      expectedOutcome: 'Reduce placement time by 25%, increase success rate by 15%',
      costSavings: 890000,
      status: 'in_progress'
    },
    {
      id: 3,
      title: 'Automate Document Verification',
      description: 'Use AI-powered document analysis to reduce manual verification time',
      priority: 'medium',
      effort: 'medium',
      impact: 'high',
      timeline: '3-5 weeks',
      resources: ['AI/ML team', 'Document processing system', 'Quality assurance'],
      expectedOutcome: 'Reduce processing time by 40%, improve accuracy by 20%',
      costSavings: 320000,
      status: 'recommended'
    }
  ];

  const marketIntelligence = [
    {
      region: 'UAE',
      demandTrend: 'increasing',
      growth: 18.5,
      hotSectors: ['Healthcare', 'Hospitality', 'Technology'],
      riskLevel: 'low',
      opportunities: 2.4,
      threats: 0.3
    },
    {
      region: 'Saudi Arabia',
      demandTrend: 'stable',
      growth: 12.8,
      hotSectors: ['Healthcare', 'Construction', 'Education'],
      riskLevel: 'medium',
      opportunities: 1.8,
      threats: 0.7
    },
    {
      region: 'Qatar',
      demandTrend: 'increasing',
      growth: 25.3,
      hotSectors: ['Construction', 'Hospitality', 'Infrastructure'],
      riskLevel: 'low',
      opportunities: 3.1,
      threats: 0.2
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
                <p className="text-gray-600">Intelligent Business Analytics & Predictions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                Real-time Analysis
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Target className="h-3 w-3 mr-1" />
                {aiMetrics.predictionAccuracy}% Accuracy
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {aiMetrics.efficiencyGain}% Efficiency Gain
              </Badge>
            </div>
          </div>
          
          {/* AI Assistant Toggle */}
          <div className="text-right">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              <button
                onClick={() => setAiAssistantActive(!aiAssistantActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiAssistantActive ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiAssistantActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="font-bold text-purple-600">{aiMetrics.insightsGenerated}</div>
                <div className="text-gray-600">Insights</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{formatCurrency(aiMetrics.costSavings)}</div>
                <div className="text-gray-600">Saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">Accuracy</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{aiMetrics.predictionAccuracy}%</div>
          <div className="text-sm text-gray-600">Prediction Accuracy</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-blue-100 text-blue-700">Generated</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{aiMetrics.actionsRecommended}</div>
          <div className="text-sm text-gray-600">Actions Recommended</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-700">Optimized</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{aiMetrics.decisionsOptimized}</div>
          <div className="text-sm text-gray-600">Decisions Optimized</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-yellow-100 text-yellow-700">Savings</Badge>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(aiMetrics.costSavings)}</div>
          <div className="text-sm text-gray-600">Cost Savings</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-12 rounded-xl">
          <TabsTrigger value="insights" className="px-6 py-2 rounded-lg">Smart Insights</TabsTrigger>
          <TabsTrigger value="predictions" className="px-6 py-2 rounded-lg">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations" className="px-6 py-2 rounded-lg">Recommendations</TabsTrigger>
          <TabsTrigger value="market" className="px-6 py-2 rounded-lg">Market Intelligence</TabsTrigger>
          <TabsTrigger value="assistant" className="px-6 py-2 rounded-lg">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">AI-Generated Business Insights</h3>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Analysis
                </Badge>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{insight.title}</h4>
                        <Badge className={
                          insight.status === 'urgent' ? 'bg-red-100 text-red-700' :
                          insight.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          insight.status === 'actionable' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }>
                          {insight.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{insight.confidence}%</div>
                          <div className="text-xs text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            insight.impact === 'high' ? 'text-red-600' :
                            insight.impact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {insight.impact}
                          </div>
                          <div className="text-xs text-gray-600">Impact</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{insight.timeframe}</div>
                          <div className="text-xs text-gray-600">Timeline</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            insight.potentialRevenue > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {insight.potentialRevenue > 0 ? '+' : ''}{formatCurrency(insight.potentialRevenue)}
                          </div>
                          <div className="text-xs text-gray-600">Potential Impact</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-gray-900">Recommended Action</span>
                        </div>
                        <p className="text-sm text-gray-700">{insight.action}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Insight
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">AI Predictions & Forecasts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiPredictions.map((prediction, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{prediction.metric}</h4>
                    <Badge className="bg-blue-100 text-blue-700">
                      {prediction.accuracy}% Accuracy
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg text-gray-600 mb-1">Current</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {prediction.metric.includes('Time') ? `${prediction.current} days` :
                         prediction.metric.includes('Rate') ? `${prediction.current}%` :
                         prediction.metric.includes('Revenue') ? formatCurrency(prediction.current) :
                         prediction.current.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-gray-600 mb-1">Predicted</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {prediction.metric.includes('Time') ? `${prediction.predicted} days` :
                         prediction.metric.includes('Rate') ? `${prediction.predicted}%` :
                         prediction.metric.includes('Revenue') ? formatCurrency(prediction.predicted) :
                         prediction.predicted.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <div className={`flex items-center space-x-2 ${
                      prediction.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {prediction.change > 0 ? <TrendingUp className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                      <span className="text-lg font-semibold">
                        {prediction.change > 0 ? '+' : ''}{prediction.change}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Timeframe: {prediction.timeframe}</div>
                    <Progress value={prediction.accuracy} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900">Key Factors:</div>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">AI-Powered Recommendations</h3>
            
            <div className="space-y-6">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{rec.title}</h4>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {rec.priority} priority
                        </Badge>
                        <Badge className={
                          rec.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          rec.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {rec.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            rec.effort === 'high' ? 'text-red-600' :
                            rec.effort === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {rec.effort}
                          </div>
                          <div className="text-xs text-gray-600">Effort Required</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            rec.impact === 'very_high' ? 'text-purple-600' :
                            rec.impact === 'high' ? 'text-red-600' :
                            rec.impact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {rec.impact.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-600">Business Impact</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{rec.timeline}</div>
                          <div className="text-xs text-gray-600">Timeline</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(rec.costSavings)}</div>
                          <div className="text-xs text-gray-600">Est. Savings</div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Expected Outcome</span>
                        </div>
                        <p className="text-sm text-blue-700">{rec.expectedOutcome}</p>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">Required Resources:</div>
                        <div className="flex flex-wrap gap-1">
                          {rec.resources.map((resource, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Rocket className="h-4 w-4 mr-2" />
                        Implement
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Plan
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Market Intelligence Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketIntelligence.map((market, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-gray-900">{market.region}</h4>
                    <Badge className={
                      market.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                      market.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {market.riskLevel} risk
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Demand Trend</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className={`h-4 w-4 ${
                          market.demandTrend === 'increasing' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                        <span className="text-sm font-medium capitalize">{market.demandTrend}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">+{market.growth}%</div>
                    <div className="text-sm text-gray-600">Growth rate</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Hot Sectors:</div>
                    <div className="flex flex-wrap gap-1">
                      {market.hotSectors.map((sector, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{market.opportunities}M</div>
                      <div className="text-xs text-gray-600">Opportunities</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{market.threats}M</div>
                      <div className="text-xs text-gray-600">Threats</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Trends Visualization */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Cross-Market Analysis</h4>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive market analysis charts</p>
                  <p className="text-sm text-gray-500">Real-time demand forecasting and opportunity mapping</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">AI Assistant Chat</h3>
              <div className="flex items-center space-x-3">
                <Badge className={aiAssistantActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {aiAssistantActive ? 'Online' : 'Offline'}
                </Badge>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 h-96 flex flex-col">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* AI Assistant Messages */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-gray-900">
                          Hello! I'm your AI assistant. I can help you analyze data, provide insights, and answer questions about your recruitment operations. What would you like to know?
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-md">
                        <p className="text-sm">
                          What are the top 3 improvement opportunities for our UAE operations?
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">U</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-gray-900 mb-2">
                          Based on my analysis, here are the top 3 improvement opportunities for UAE operations:
                        </p>
                        <ol className="text-sm text-gray-900 space-y-1">
                          <li>1. **Agent Training Optimization** - Could increase success rate by 12%</li>
                          <li>2. **Healthcare Sector Expansion** - $4.5M revenue opportunity</li>
                          <li>3. **Processing Time Reduction** - AI automation could cut 25% of time</li>
                        </ol>
                        <p className="text-sm text-gray-600 mt-2">
                          Would you like me to elaborate on any of these recommendations?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Ask me anything about your business..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        disabled={!aiAssistantActive}
                      />
                      <Button 
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={!aiAssistantActive}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    {[
                      'Analyze performance trends',
                      'Generate market report',
                      'Identify cost savings',
                      'Predict demand changes',
                      'Optimize agent allocation'
                    ].map((action, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={!aiAssistantActive}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">AI Capabilities</h4>
                  <div className="space-y-3">
                    {[
                      { feature: 'Predictive Analytics', status: 'active' },
                      { feature: 'Market Intelligence', status: 'active' },
                      { feature: 'Performance Optimization', status: 'active' },
                      { feature: 'Risk Assessment', status: 'active' },
                      { feature: 'Natural Language Q&A', status: 'active' }
                    ].map((capability, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{capability.feature}</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {capability.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsModule;