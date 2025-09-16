import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  GraduationCap,
  PlayCircle,
  BookOpen,
  Award,
  Users,
  Clock,
  Star,
  TrendingUp,
  Globe,
  Headphones,
  Video,
  FileText,
  Target,
  Zap,
  Brain,
  Sparkles,
  ChevronRight,
  Trophy,
  Calendar,
  MessageCircle,
  CheckCircle,
  Lock
} from 'lucide-react';

const JawalAcademyModule = () => {
  const [selectedSkill, setSelectedSkill] = useState('hospitality');
  const [userProgress, setUserProgress] = useState({
    completedCourses: 12,
    totalHours: 145,
    certifications: 8,
    currentStreak: 15,
    level: 'Advanced',
    nextLevelProgress: 78
  });

  const skillCategories = [
    { 
      id: 'hospitality', 
      name: 'Hospitality & Service', 
      icon: '🏨', 
      courses: 24, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Master hotel, restaurant, and customer service skills'
    },
    { 
      id: 'construction', 
      name: 'Construction & Engineering', 
      icon: '🏗️', 
      courses: 18, 
      color: 'from-orange-500 to-red-500',
      description: 'Learn technical skills for Gulf construction projects'
    },
    { 
      id: 'healthcare', 
      name: 'Healthcare & Nursing', 
      icon: '🏥', 
      courses: 21, 
      color: 'from-green-500 to-emerald-500',
      description: 'Medical and caregiving certification programs'
    },
    { 
      id: 'domestic', 
      name: 'Domestic Services', 
      icon: '🏠', 
      courses: 15, 
      color: 'from-purple-500 to-pink-500',
      description: 'Household management and childcare expertise'
    },
    { 
      id: 'logistics', 
      name: 'Logistics & Driving', 
      icon: '🚛', 
      courses: 12, 
      color: 'from-yellow-500 to-orange-500',
      description: 'Transport and supply chain management'
    },
    { 
      id: 'language', 
      name: 'Language Skills', 
      icon: '🗣️', 
      courses: 36, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Arabic, English, and cultural communication'
    }
  ];

  const featuredCourses = [
    {
      id: 1,
      title: 'Advanced Arabic for Hospitality',
      instructor: 'Dr. Ahmed Al-Mansouri',
      duration: '6 weeks',
      level: 'Intermediate',
      rating: 4.9,
      students: 2847,
      thumbnail: '🗣️',
      price: 'Free',
      category: 'Language',
      skills: ['Arabic Conversation', 'Professional Terms', 'Cultural Etiquette'],
      progress: 65
    },
    {
      id: 2,
      title: 'UAE Healthcare Protocols',
      instructor: 'Nurse Sarah Al-Zahra',
      duration: '4 weeks',
      level: 'Beginner',
      rating: 4.8,
      students: 1923,
      thumbnail: '🏥',
      price: 'Premium',
      category: 'Healthcare',
      skills: ['Patient Care', 'Medical Documentation', 'Emergency Procedures'],
      progress: 0
    },
    {
      id: 3,
      title: 'Construction Safety & Standards',
      instructor: 'Eng. Mohammed Hassan',
      duration: '8 weeks',
      level: 'Advanced',
      rating: 4.7,
      students: 3156,
      thumbnail: '🏗️',
      price: 'Free',
      category: 'Construction',
      skills: ['Safety Protocols', 'Quality Control', 'Team Leadership'],
      progress: 100
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'UAE Hotel Manager Track',
      description: 'Complete certification path for hotel management roles in UAE',
      duration: '12 weeks',
      courses: 8,
      difficulty: 'Advanced',
      completion: 45,
      skills: ['Leadership', 'Operations', 'Customer Service', 'Arabic'],
      salary: '$3,500 - $5,000',
      placement: '94% placement rate'
    },
    {
      id: 2,
      title: 'Saudi Healthcare Assistant',
      description: 'Specialized training for healthcare roles in Saudi Arabia',
      duration: '10 weeks',
      courses: 6,
      difficulty: 'Intermediate',
      completion: 0,
      skills: ['Patient Care', 'Medical Arabic', 'Documentation', 'Ethics'],
      salary: '$2,800 - $4,200',
      placement: '89% placement rate'
    },
    {
      id: 3,
      title: 'Qatar Construction Supervisor',
      description: 'Leadership training for construction and engineering projects',
      duration: '16 weeks',
      courses: 12,
      difficulty: 'Expert',
      completion: 78,
      skills: ['Project Management', 'Safety', 'Technical Drawing', 'Team Building'],
      salary: '$4,000 - $6,500',
      placement: '96% placement rate'
    }
  ];

  const achievements = [
    { id: 1, title: 'First Course Completed', icon: '🎯', unlocked: true, date: '2 weeks ago' },
    { id: 2, title: 'Language Master', icon: '🗣️', unlocked: true, date: '1 week ago' },
    { id: 3, title: 'Safety Expert', icon: '🛡️', unlocked: true, date: '3 days ago' },
    { id: 4, title: 'Cultural Ambassador', icon: '🌍', unlocked: false, progress: 60 },
    { id: 5, title: 'Mentor Status', icon: '👨‍🏫', unlocked: false, progress: 30 },
    { id: 6, title: 'Certification Champion', icon: '🏆', unlocked: false, progress: 85 }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jawal Academy</h1>
                <p className="text-gray-600">Skills Development Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered Learning
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Globe className="h-3 w-3 mr-1" />
                VR Training Available
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Award className="h-3 w-3 mr-1" />
                Blockchain Certified
              </Badge>
            </div>
          </div>
          
          {/* User Progress Summary */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userProgress.completedCourses}</div>
                <div className="text-xs text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userProgress.totalHours}h</div>
                <div className="text-xs text-gray-600">Learning</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Level: {userProgress.level}</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-1000"
                  style={{ width: `${userProgress.nextLevelProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{userProgress.nextLevelProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-700">+12% this week</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{userProgress.certifications}</div>
            <div className="text-sm text-gray-600">Certifications Earned</div>
          </div>

          <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-700">Current streak</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{userProgress.currentStreak}</div>
            <div className="text-sm text-gray-600">Days Learning</div>
          </div>

          <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-700">AI Powered</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">92%</div>
            <div className="text-sm text-gray-600">Skill Match Score</div>
          </div>
        </div>

        {/* AI Learning Assistant */}
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">AI Learning Coach</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">Recommended Next</div>
              <div className="text-xs text-gray-600">Complete "Arabic Hospitality" to unlock UAE Hotel Track</div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">Study Reminder</div>
              <div className="text-xs text-gray-600">15 minutes daily keeps your streak alive</div>
            </div>
            <Button size="sm" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI Coach
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-12 rounded-xl">
          <TabsTrigger value="courses" className="px-6 py-2 rounded-lg">Skill Courses</TabsTrigger>
          <TabsTrigger value="paths" className="px-6 py-2 rounded-lg">Learning Paths</TabsTrigger>
          <TabsTrigger value="vr-training" className="px-6 py-2 rounded-lg">VR Training</TabsTrigger>
          <TabsTrigger value="mentorship" className="px-6 py-2 rounded-lg">Mentorship</TabsTrigger>
          <TabsTrigger value="achievements" className="px-6 py-2 rounded-lg">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {/* Skill Categories */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Choose Your Skill Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedSkill(category.id)}
                  className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedSkill === category.id
                      ? 'border-purple-300 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.courses} courses</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Courses */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-gray-900">Featured Courses</h3>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <div key={course.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{course.thumbnail}</div>
                      <Badge className={course.price === 'Free' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {course.price}
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{course.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                      {course.progress > 0 ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Course
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Career Learning Paths</h3>
            <div className="space-y-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-xl text-gray-900">{path.title}</h4>
                        <Badge className="bg-blue-100 text-blue-700">{path.difficulty}</Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{path.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{path.duration}</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{path.courses}</div>
                          <div className="text-xs text-gray-600">Courses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{path.salary}</div>
                          <div className="text-xs text-gray-600">Salary Range</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{path.placement}</div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {path.completion > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{path.completion}% complete</span>
                      </div>
                      <Progress value={path.completion} className="h-3" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {path.completion > 0 ? 'Continue your journey' : 'Ready to start your career path?'}
                    </div>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {path.completion > 0 ? 'Continue Path' : 'Start Path'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vr-training" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-semibold text-2xl text-gray-900 mb-2">Virtual Reality Training</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience immersive job simulations that prepare you for real-world scenarios in Gulf countries. 
                Practice in safe virtual environments before your actual deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Hotel Reception Simulation',
                  description: 'Practice customer interactions in luxury UAE hotels',
                  duration: '30 min',
                  difficulty: 'Beginner',
                  students: 1247,
                  rating: 4.8,
                  thumbnail: '🏨'
                },
                {
                  title: 'Construction Site Safety',
                  description: 'Navigate safety protocols in Qatar construction projects',
                  duration: '45 min',
                  difficulty: 'Intermediate',
                  students: 892,
                  rating: 4.9,
                  thumbnail: '🏗️'
                },
                {
                  title: 'Hospital Patient Care',
                  description: 'Medical care scenarios in Saudi healthcare facilities',
                  duration: '60 min',
                  difficulty: 'Advanced',
                  students: 634,
                  rating: 4.7,
                  thumbnail: '🏥'
                }
              ].map((simulation, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{simulation.thumbnail}</div>
                      <Badge className="bg-cyan-100 text-cyan-700">VR Experience</Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{simulation.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{simulation.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{simulation.duration}</span>
                      <span>{simulation.difficulty}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{simulation.rating}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Enter VR Simulation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Expert Mentorship Program</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Find Your Mentor</h4>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Sarah Al-Mansouri',
                        role: 'Hotel Manager, Dubai',
                        experience: '12 years',
                        specialty: 'Hospitality Leadership',
                        rating: 4.9,
                        sessions: 247,
                        avatar: '👩‍💼'
                      },
                      {
                        name: 'Dr. Ahmed Hassan',
                        role: 'Healthcare Director, Saudi',
                        experience: '15 years',
                        specialty: 'Medical Career Growth',
                        rating: 4.8,
                        sessions: 189,
                        avatar: '👨‍⚕️'
                      }
                    ].map((mentor, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-3xl">{mentor.avatar}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{mentor.name}</div>
                          <div className="text-sm text-gray-600">{mentor.role}</div>
                          <div className="text-xs text-gray-500">{mentor.experience} • {mentor.sessions} sessions</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{mentor.rating}</span>
                          </div>
                          <Button size="sm" variant="outline">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Peer Learning Community</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">JM</div>
                        <div>
                          <div className="font-medium text-gray-900">James Mukasa</div>
                          <div className="text-sm text-gray-600">Construction Supervisor, Qatar</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">RN</div>
                        <div>
                          <div className="font-medium text-gray-900">Rebecca Namuli</div>
                          <div className="text-sm text-gray-600">Nurse, Saudi Arabia</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white">
                      <Users className="h-4 w-4 mr-2" />
                      Join Study Groups
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Upcoming Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Arabic Conversation Practice</div>
                        <div className="text-sm text-gray-600">Today, 7:00 PM</div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Career Planning Session</div>
                        <div className="text-sm text-gray-600">Tomorrow, 2:00 PM</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Your Learning Achievements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    achievement.unlocked
                      ? 'border-yellow-300 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-6xl mb-3 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <h4 className={`font-semibold mb-2 ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    {achievement.unlocked ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Unlocked {achievement.date}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Lock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{achievement.progress}% complete</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JawalAcademyModule;