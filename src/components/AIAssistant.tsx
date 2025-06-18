import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Lightbulb,
  Code,
  Shield,
  TrendingUp,
  FileText,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';
import { ChatMessage } from '../types';

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your DevSecOps AI Assistant. I can help you with log analysis, security recommendations, performance optimization, and answer questions about your infrastructure. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      icon: Shield,
      title: 'Security Analysis',
      description: 'Analyze recent security alerts and suggest fixes',
      prompt: 'Analyze the recent security vulnerabilities and provide prioritized recommendations for fixing them.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Review',
      description: 'Review system performance metrics',
      prompt: 'Review the current system performance metrics and identify potential bottlenecks or optimization opportunities.'
    },
    {
      icon: FileText,
      title: 'Log Summarization',
      description: 'Summarize recent application logs',
      prompt: 'Summarize the recent application logs and highlight any errors or anomalies that need attention.'
    },
    {
      icon: Code,
      title: 'Pipeline Optimization',
      description: 'Optimize CI/CD pipeline configuration',
      prompt: 'Analyze our CI/CD pipelines and suggest optimizations to reduce build times and improve reliability.'
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('security') || lowerInput.includes('vulnerability')) {
      return `Based on your recent security scan results, I've identified several key areas for improvement:

**Critical Issues (2):**
- SQL Injection vulnerability in user authentication - Fix by updating express-validator to v6.14.2
- Outdated cryptographic library - Upgrade crypto-js to v4.1.1

**Recommendations:**
1. Implement input validation middleware across all API endpoints
2. Set up automated dependency scanning in your CI pipeline
3. Enable CSP headers for additional protection

**Next Steps:**
- Run \`npm audit fix\` to auto-update vulnerable packages
- Review and update your authentication middleware
- Consider implementing rate limiting for API endpoints

Would you like me to generate specific code examples for any of these fixes?`;
    }
    
    if (lowerInput.includes('performance') || lowerInput.includes('optimization')) {
      return `I've analyzed your system metrics and identified several optimization opportunities:

**Current Status:**
- CPU usage averaging 67% (elevated)
- Memory usage at 45% (healthy)
- API response time: 245ms (acceptable but improvable)

**Performance Bottlenecks:**
1. High CPU usage on worker-2 node (89%)
2. Database query times averaging 23ms
3. Unoptimized container images increasing startup time

**Recommendations:**
1. **Immediate:** Scale worker-2 or redistribute workload
2. **Short-term:** Implement database query caching
3. **Long-term:** Optimize Docker images using multi-stage builds

**Expected Impact:**
- 30% reduction in response times
- 25% decrease in resource usage
- Improved user experience during peak loads

Would you like detailed implementation steps for any of these optimizations?`;
    }
    
    if (lowerInput.includes('log') || lowerInput.includes('error')) {
      return `I've analyzed your recent application logs and found the following patterns:

**Log Summary (Last 24 hours):**
- Total log entries: 45,234
- Error rate: 0.12% (54 errors)
- Warning rate: 2.3% (1,040 warnings)

**Key Findings:**
1. **Database Connection Timeouts** (23 occurrences)
   - Peak times: 2-4 PM and 8-10 PM
   - Likely cause: Connection pool exhaustion

2. **API Rate Limit Exceeded** (18 occurrences)
   - Affected endpoint: /api/v1/data
   - Suggests need for client-side throttling

3. **Memory Leak Indicators** (3 warnings)
   - Gradual memory increase in worker processes
   - Recommend heap dump analysis

**Suggested Actions:**
- Increase database connection pool size
- Implement API client retry logic with exponential backoff
- Schedule memory profiling session

Would you like me to create monitoring alerts for these specific patterns?`;
    }
    
    if (lowerInput.includes('pipeline') || lowerInput.includes('ci/cd')) {
      return `I've reviewed your CI/CD pipeline configuration and identified several optimization opportunities:

**Current Pipeline Analysis:**
- Average build time: 12 minutes
- Success rate: 87% (good but improvable)
- Most common failure: Test timeouts (34%)

**Optimization Recommendations:**

1. **Parallel Execution:**
   - Run tests and security scans in parallel
   - Estimated time savings: 4-6 minutes

2. **Caching Strategy:**
   - Implement Docker layer caching
   - Cache npm/pip dependencies
   - Expected improvement: 40% faster builds

3. **Test Optimization:**
   - Split integration tests into smaller chunks
   - Add timeout configuration for flaky tests
   - Run unit tests before integration tests

4. **Resource Allocation:**
   - Increase memory for test runners
   - Use faster build agents for critical branches

**Implementation Priority:**
1. Enable dependency caching (Quick win)
2. Parallelize pipeline stages
3. Optimize test execution

Would you like me to generate the updated pipeline configuration YAML?`;
    }
    
    return `I understand you'd like help with: "${userInput}"

I can assist you with various DevSecOps tasks including:

• **Security Analysis** - Vulnerability assessment and remediation
• **Performance Monitoring** - System optimization and bottleneck identification  
• **Log Analysis** - Error pattern detection and root cause analysis
• **Pipeline Optimization** - CI/CD improvement recommendations
• **Infrastructure Insights** - Resource usage and scaling recommendations

Could you please provide more specific details about what you'd like me to analyze or help you with?`;
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-full">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI DevSecOps Assistant</h1>
              <p className="text-sm text-gray-600">Intelligent analysis and recommendations for your infrastructure</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              placeholder="Ask me about security, performance, logs, or pipeline optimization..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="space-y-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-900">Security Scan</span>
              </div>
              <p className="text-xs text-gray-600">2 critical vulnerabilities fixed</p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Performance</span>
              </div>
              <p className="text-xs text-gray-600">API response time improved by 15%</p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Pipeline</span>
              </div>
              <p className="text-xs text-gray-600">Build time reduced by 4 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}