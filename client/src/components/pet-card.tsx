import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface PetCardProps {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  price: number;
  image: string;
  location: string;
  isFeatured?: boolean;
  isPerfectMatch?: boolean;
  isVerified?: boolean;
  listingType?: string;
  description?: string;
  isFavorite?: boolean;
}

export default function PetCard({
  id,
  name,
  type,
  breed,
  age,
  price,
  image,
  location,
  isFeatured = false,
  isPerfectMatch = false,
  isVerified = false,
  listingType = "sale",
  description,
  isFavorite: initialIsFavorite = false
}: PetCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  
  const getFormattedAge = () => {
    if (age < 12) {
      return `${age} ${age === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(age / 12);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };
  
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/favorites', { petId: id });
    },
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: `${name} has been added to your favorites.`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
      });
    }
  });
  
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/favorites/${id}`);
    },
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: `${name} has been removed from your favorites.`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
      });
    }
  });
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to add pets to your favorites.",
      });
      return;
    }
    
    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };
  
  const getListingTypeBadge = () => {
    switch (listingType) {
      case 'adoption':
        return (
          <Badge className="absolute top-3 left-3 bg-[#8BC34A] hover:bg-[#8BC34A] text-white">
            Adoption
          </Badge>
        );
      case 'rehome':
        return (
          <Badge className="absolute top-3 left-3 bg-[#FF9800] hover:bg-[#FF9800] text-white">
            Rehome
          </Badge>
        );
      default:
        return isFeatured ? (
          <Badge className="absolute top-3 left-3 bg-[#5CA9DD] hover:bg-[#5CA9DD] text-white">
            Featured
          </Badge>
        ) : null;
    }
  };
  
  return (
    <Link href={`/pet/${id}`}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition duration-300 h-full">
        <div className="relative">
          <img 
            src={image} 
            alt={`${name} - ${breed}`} 
            className="w-full h-[200px] object-cover"
          />
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-1.5 ${isFavorite ? 'text-[#FF8C69]' : 'text-neutral-400 hover:text-[#FF8C69]'}`}
            onClick={handleFavoriteToggle}
          >
            <Heart className={isFavorite ? "fill-current" : ""} />
          </Button>
          
          {getListingTypeBadge()}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-500/80 to-transparent p-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">${price}</span>
              {isPerfectMatch && (
                <Badge className="bg-[#8BC34A] hover:bg-[#8BC34A] text-white">
                  Perfect Match
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{name}</h3>
            <Badge variant="outline" className="bg-[#5CA9DD] hover:bg-[#5CA9DD] text-white">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
          
          <p className="text-neutral-600 text-sm mb-2">{breed} • {getFormattedAge()}</p>
          
          {description && (
            <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
            
            {isVerified && (
              <Badge variant="outline" className="bg-[#4CAF50] text-white text-xs hover:bg-[#4CAF50]">
                Verified
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
