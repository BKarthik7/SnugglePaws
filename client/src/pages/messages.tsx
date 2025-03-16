import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Message as MessageType, Pet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle redirect in useEffect to avoid React hook issues
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Get all conversations
  const { data: allMessages, isLoading: isLoadingMessages } = useQuery<MessageType[]>({
    queryKey: ['/api/messages'],
  });

  // Get selected conversation messages
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<MessageType[]>({
    queryKey: ['/api/messages/conversation', selectedConversation],
    enabled: !!selectedConversation,
  });

  // Get all users for the conversations
  const { data: users } = useQuery<Record<number, User>>({
    queryKey: ['/api/users'],
    enabled: !!allMessages,
    select: (data: User[]) => {
      return data.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<number, User>);
    }
  });

  // Get all pets for the conversations
  const { data: pets } = useQuery<Record<number, Pet>>({
    queryKey: ['/api/pets'],
    enabled: !!allMessages,
    select: (data: Pet[]) => {
      return data.reduce((acc, pet) => {
        acc[pet.id] = pet;
        return acc;
      }, {} as Record<number, Pet>);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversation || !messageText.trim()) return;
      
      await apiRequest("POST", "/api/messages", {
        receiverId: selectedConversation,
        content: messageText,
        petId: null
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', selectedConversation] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again",
      });
    },
  });

  // Process conversations from messages
  const conversations = allMessages ? getConversationsFromMessages(allMessages) : [];

  // Get unique conversations
  function getConversationsFromMessages(messages: MessageType[]): {
    userId: number;
    lastMessage: MessageType;
    unreadCount: number;
  }[] {
    const conversationsMap = new Map<number, {
      userId: number;
      lastMessage: MessageType;
      unreadCount: number;
    }>();

    // Group messages by conversation
    messages.forEach(message => {
      const otherUserId = message.senderId === user?.id 
        ? message.receiverId 
        : message.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: message,
          unreadCount: message.receiverId === user?.id && !message.isRead ? 1 : 0,
        });
      } else {
        const existing = conversationsMap.get(otherUserId)!;
        
        // Update last message if this one is newer
        if (new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
          existing.lastMessage = message;
        }
        
        // Count unread messages
        if (message.receiverId === user?.id && !message.isRead) {
          existing.unreadCount += 1;
        }
        
        conversationsMap.set(otherUserId, existing);
      }
    });

    // Convert Map to array and sort by most recent message
    return Array.from(conversationsMap.values())
      .sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - 
        new Date(a.lastMessage.createdAt).getTime()
      );
  }

  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        const otherUser = users?.[conv.userId];
        if (!otherUser) return false;
        
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  // Scroll to bottom whenever conversation changes or new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Get user name and image
  const getUserInfo = (userId: number) => {
    const defaultUser = { name: "User", profileImage: "" };
    return users ? users[userId] || defaultUser : defaultUser;
  };

  // Get pet info if available
  const getPetInfo = (petId: number | null) => {
    if (!petId || !pets) return null;
    return pets[petId];
  };

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-700 mb-6">Messages</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-1/3">
          <Card className="h-[600px] flex flex-col">
            <div className="p-4 border-b">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <ScrollArea className="flex-1">
              {isLoadingMessages ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <div>
                  {filteredConversations.map((conv) => {
                    const otherUser = getUserInfo(conv.userId);
                    const isSelected = selectedConversation === conv.userId;
                    const lastMessagePet = getPetInfo(conv.lastMessage.petId || 0);
                    
                    return (
                      <div 
                        key={conv.userId}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-gray-100' : ''
                        } ${conv.unreadCount > 0 ? 'font-semibold' : ''}`}
                        onClick={() => setSelectedConversation(conv.userId)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="text-sm font-medium truncate">
                                {otherUser.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <p className="text-xs text-gray-500 truncate flex-1">
                                {conv.lastMessage.senderId === user.id ? 'You: ' : ''}
                                {conv.lastMessage.content}
                              </p>
                              
                              {conv.unreadCount > 0 && (
                                <Badge className="ml-2 bg-[#FF8C69] hover:bg-[#FF8C69]">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            
                            {lastMessagePet && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Re: {lastMessagePet.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a conversation by contacting a pet owner or seller.
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
        
        {/* Conversation */}
        <div className="w-full md:w-2/3">
          <Card className="h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={getUserInfo(selectedConversation).profileImage} 
                      alt={getUserInfo(selectedConversation).name} 
                    />
                    <AvatarFallback>
                      {getUserInfo(selectedConversation).name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{getUserInfo(selectedConversation).name}</h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {getUserInfo(selectedConversation).userType?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingConversation ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                          <div className={`rounded-lg p-3 max-w-[80%] ${
                            i % 2 === 0 ? 'bg-[#FF8C69]/10 ml-auto' : 'bg-gray-100'
                          } animate-pulse h-12`}></div>
                        </div>
                      ))}
                    </div>
                  ) : conversation && conversation.length > 0 ? (
                    <div className="space-y-4">
                      {conversation.map((message) => {
                        const isCurrentUser = message.senderId === user.id;
                        const petInfo = getPetInfo(message.petId || 0);
                        
                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : ''}`}>
                            <div className="max-w-[80%]">
                              {petInfo && !isCurrentUser && (
                                <div className="mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Re: {petInfo.name}
                                  </Badge>
                                </div>
                              )}
                              
                              <div className={`rounded-lg p-3 ${
                                isCurrentUser 
                                  ? 'bg-[#FF8C69]/10 text-neutral-800' 
                                  : 'bg-gray-100 text-neutral-800'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              
                              {petInfo && isCurrentUser && (
                                <div className="mt-1 text-right">
                                  <Badge variant="outline" className="text-xs">
                                    Re: {petInfo.name}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="font-medium text-gray-900">No messages yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Send a message to start the conversation
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 resize-none"
                      rows={1}
                    />
                    <Button 
                      type="submit" 
                      className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h2>
                  <p className="text-gray-600 mb-6">
                    Select a conversation from the list to view and send messages. Messages are a great way to inquire about pets and coordinate meetings.
                  </p>
                  <Button 
                    className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                    onClick={() => navigate("/explore")}
                  >
                    Browse Pets
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
