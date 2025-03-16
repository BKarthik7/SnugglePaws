import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Pet, User, Message } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Mail, AlertTriangle, Check, Calendar, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PetDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  // Fetch pet details
  const { data: pet, isLoading } = useQuery<Pet>({
    queryKey: [`/api/pets/${id}`],
  });

  // Fetch pet seller info if pet exists
  const { data: seller } = useQuery<User>({
    queryKey: [`/api/users/${pet?.sellerId}`],
    enabled: !!pet,
  });

  // Check if pet is favorited
  const { data: isFavorite } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/check/${id}`],
    enabled: !!user && !!id,
  });

  // Add/Remove from favorites
  const favoriteToggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`, {});
      } else {
        await apiRequest("POST", "/api/favorites", { petId: Number(id) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: isFavorite?.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${pet?.name} has been ${isFavorite?.isFavorite ? "removed from" : "added to"} your favorites.`,
      });
    }
  });

  // Send message to seller
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!pet || !user) return;
      
      await apiRequest("POST", "/api/messages", {
        receiverId: pet.sellerId,
        content: messageContent,
        petId: pet.id
      });
    },
    onSuccess: () => {
      setMessageOpen(false);
      setMessageContent("");
      
      toast({
        title: "Message sent",
        description: `Your message about ${pet?.name} has been sent to ${seller?.name}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to add pets to your favorites",
      });
      navigate("/login");
      return;
    }
    
    favoriteToggleMutation.mutate();
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast({
        variant: "destructive",
        title: "Empty message",
        description: "Please enter a message",
      });
      return;
    }
    
    sendMessageMutation.mutate();
  };

  const handleContactClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to contact the seller",
      });
      navigate("/login");
      return;
    }
    
    setMessageOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[400px] bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pet not found
  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-16 w-16 text-[#FF9800] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-neutral-700 mb-4">Pet Not Found</h1>
        <p className="text-neutral-500 mb-8">The pet you're looking for doesn't exist or has been removed.</p>
        <Link href="/explore">
          <Button className="bg-[#FF8C69] hover:bg-[#FF8C69]/90">
            Browse Other Pets
          </Button>
        </Link>
      </div>
    );
  }

  // Format age display
  const getFormattedAge = () => {
    if (!pet.age) return "Age unknown";
    
    if (pet.age < 12) {
      return `${pet.age} ${pet.age === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(pet.age / 12);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  // Get listing type badge
  const getListingTypeBadge = () => {
    switch (pet.listingType) {
      case 'adoption':
        return (
          <Badge className="bg-[#8BC34A] hover:bg-[#8BC34A] text-white">
            Adoption
          </Badge>
        );
      case 'rehome':
        return (
          <Badge className="bg-[#FF9800] hover:bg-[#FF9800] text-white">
            Rehome
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#5CA9DD] hover:bg-[#5CA9DD] text-white">
            For Sale
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/explore">
          <a className="text-[#FF8C69] hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search Results
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pet Image Section */}
        <div>
          <div className="relative rounded-lg overflow-hidden shadow-md bg-white">
            <img 
              src={pet.images?.[0] || "https://via.placeholder.com/500x400?text=No+Image+Available"} 
              alt={pet.name} 
              className="w-full h-[400px] object-cover"
            />
            {pet.isFeatured && (
              <Badge className="absolute top-4 left-4 bg-[#5CA9DD] hover:bg-[#5CA9DD] text-white">
                Featured
              </Badge>
            )}
            <Button 
              size="icon"
              variant="outline"
              className={`absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full ${
                isFavorite?.isFavorite ? 'text-[#FF8C69]' : 'text-neutral-400 hover:text-[#FF8C69]'
              }`}
              onClick={handleFavoriteToggle}
            >
              <Heart className={isFavorite?.isFavorite ? "fill-current" : ""} />
            </Button>
          </div>

          {/* Additional images (if available) */}
          {pet.images && pet.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {pet.images.slice(1, 5).map((image, index) => (
                <div key={index} className="rounded-md overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${pet.name} additional view ${index + 1}`} 
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pet Details Section */}
        <div>
          <div className="flex flex-wrap items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-neutral-700">{pet.name}</h1>
            <div className="flex space-x-2">
              {getListingTypeBadge()}
              <Badge className="bg-[#5CA9DD] hover:bg-[#5CA9DD] text-white">
                {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
              </Badge>
            </div>
          </div>
          
          <p className="text-lg text-neutral-500 mb-6">
            {pet.breed} • {getFormattedAge()}
          </p>

          <p className="text-neutral-700 mb-6">
            {pet.description || "No description provided."}
          </p>

          <div className="bg-[#FF8C69]/10 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-700">
                ${pet.price?.toLocaleString() || 'Contact for price'}
              </h3>
              {pet.isVerified && (
                <div className="flex items-center text-[#4CAF50]">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Verified Listing</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              className="flex-1 bg-[#FF8C69] hover:bg-[#FF8C69]/90"
              onClick={handleContactClick}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact About {pet.name}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-[#FF8C69] text-[#FF8C69] hover:bg-[#FF8C69]/10"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite?.isFavorite ? "fill-[#FF8C69]" : ""}`} />
              {isFavorite?.isFavorite ? "Saved to Favorites" : "Add to Favorites"}
            </Button>
          </div>

          {/* Pet Details Card */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="seller">Seller Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm text-neutral-500">Gender</p>
                        <p className="font-semibold">{pet.gender || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#FF8C69]" />
                      <div>
                        <p className="text-sm text-neutral-500">Age</p>
                        <p className="font-semibold">{getFormattedAge()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <div>
                        <p className="text-sm text-neutral-500">Size</p>
                        <p className="font-semibold">{pet.size || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-neutral-500">Location</p>
                        <p className="font-semibold">{pet.location || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="seller">
                  {seller ? (
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full overflow-hidden h-16 w-16 flex-shrink-0">
                        <img 
                          src={seller.profileImage || "https://via.placeholder.com/100?text=No+Image"} 
                          alt={seller.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{seller.name}</h3>
                        <p className="text-neutral-500 capitalize">{seller.userType.replace('_', ' ')}</p>
                        {seller.isVerified && (
                          <Badge className="mt-1 bg-[#4CAF50] hover:bg-[#4CAF50] text-white">
                            Verified
                          </Badge>
                        )}
                        <p className="mt-2 text-sm">{seller.bio || "No bio provided"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <UserIcon className="h-10 w-10 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-500">Seller information unavailable</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact about {pet.name}</DialogTitle>
            <DialogDescription>
              Send a message to {seller?.name || "the seller"} regarding {pet.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              placeholder={`Hi, I'm interested in ${pet.name}. Is this pet still available?`}
              className="min-h-[120px]"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
