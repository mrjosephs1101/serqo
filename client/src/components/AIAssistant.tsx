import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import operatorIconPath from '@assets/OperatorIcon.png';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello. I am Operator. How may I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const { isLoading, getAnswer } = useAI();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Get AI response
      const response = await getAnswer(userMessage.content);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2">
            <img src={operatorIconPath} alt="Operator AI" className="h-5 w-5 sm:h-6 sm:w-6" />
            <CardTitle className="text-base sm:text-lg">Operator</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-3 sm:p-6 pt-0 overflow-hidden">
          <ScrollArea className="h-full pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col rounded-lg p-3 sm:p-4 text-sm sm:text-base",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-4 sm:ml-10" 
                      : "bg-muted mr-4 sm:mr-10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <Badge variant={message.role === 'user' ? "default" : "outline"} className="flex items-center gap-1 text-xs">
                      {message.role === 'user' ? 'You' : (
                        <>
                          <img src={operatorIconPath} alt="Operator" className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                          <span>Operator</span>
                        </>
                      )}
                    </Badge>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {message.role === 'assistant' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(message.content)}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        >
                          <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-sm sm:text-base">
                    {message.content}
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex justify-end items-center space-x-1 mt-2">
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
                        <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6">
                        <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="bg-muted rounded-lg p-3 sm:p-4 mr-4 sm:mr-10">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <img src={operatorIconPath} alt="Operator" className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                    <span>Operator</span>
                  </Badge>
                  <div className="mt-2 flex space-x-2">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 sm:p-4 pt-0">
          <div className="flex w-full items-center space-x-2">
            <Textarea
              className="flex-1 resize-none min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] text-sm sm:text-base"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button 
              className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-full"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}