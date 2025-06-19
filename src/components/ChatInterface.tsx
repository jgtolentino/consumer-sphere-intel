
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { handleRetailBotQuery } from '../api/retailbot';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  chart?: any;
  timestamp: string;
  dataSource?: string;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m RetailBot, your AI retail analytics assistant. I can help you analyze sales data, brand performance, and consumer insights. What would you like to explore?',
      timestamp: new Date().toISOString(),
      dataSource: 'live'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Convert messages to chat history format
      const chatHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await handleRetailBotQuery(inputValue, chatHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.reply,
        chart: response.chart,
        timestamp: response.timestamp,
        dataSource: 'live'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        dataSource: 'live'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-scout-navy">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 bg-scout-teal/10 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-scout-teal" />
              </div>
            )}
            
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
              <Card className={`p-3 ${
                message.type === 'user' 
                  ? 'bg-scout-navy text-white ml-auto dark:bg-scout-teal dark:text-scout-navy' 
                  : 'bg-scout-light dark:bg-scout-dark border-scout-teal/10'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>

              {/* Chart rendering */}
              {message.chart && (
                <Card className="mt-3 p-4 bg-scout-light dark:bg-scout-dark border-scout-teal/10">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-scout-teal" />
                    <span className="text-sm font-medium text-scout-navy dark:text-scout-teal">
                      {message.chart.title || 'Chart Data'}
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={message.chart.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#36CFC9" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#0A2540" fontSize={12} />
                        <YAxis stroke="#0A2540" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #36CFC9',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="value" fill="#36CFC9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-scout-navy/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-scout-navy dark:text-scout-teal" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-scout-teal/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-scout-teal" />
            </div>
            <Card className="p-3 bg-scout-light dark:bg-scout-dark border-scout-teal/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-scout-teal rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-scout-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-scout-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-scout-teal/10 p-4 bg-white dark:bg-scout-navy">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about sales data, brand performance, or regional trends..."
            className="flex-1 border-scout-teal/20 focus:border-scout-teal focus:ring-scout-teal"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-scout-teal hover:bg-scout-teal/90 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-scout-dark/70 dark:text-gray-400">
          💡 Try asking: "Show me Alaska Milk sales" or "Compare brand performance"
        </div>
      </div>
    </div>
  );
};
