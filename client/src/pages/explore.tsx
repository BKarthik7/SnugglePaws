import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Pet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import PetCard from "@/components/pet-card";
import FilterSidebar from "@/components/filter-sidebar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Explore() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const limit = 9; // Items per page
  
  // Parse query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const urlFilters: Record<string, any> = {};
    
    // Convert URLSearchParams to array and then iterate
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (["type", "location", "listingType"].includes(key)) {
        urlFilters[key] = value;
      } else if (["minAge", "maxAge", "minPrice", "maxPrice", "distance"].includes(key)) {
        urlFilters[key] = Number(value);
      } else if (key === "isFeatured") {
        urlFilters[key] = value === "true";
      }
    });
    
    setFilters(urlFilters);
  }, [location]);
  
  // Fetch pets based on filters
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ['/api/pets', { ...filters, limit, offset: (page - 1) * limit }],
  });
  
  // Get user favorites to check if a pet is favorited
  const { data: favorites } = useQuery<Pet[]>({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/favorites');
      if (response instanceof Response) {
        const data = await response.json();
        return data as Pet[];
      }
      return (response as Pet[]) || [];
    },
    enabled: !!user,
  });
  
  const isFavorited = (petId: number) => {
    return Array.isArray(favorites) && favorites.some(pet => pet.id === petId) || false;
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Apply sorting logic here
  };
  
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setPage(1); // Reset to first page when filters change
    setFilters(newFilters);
    
    // Update URL with new filters
    const searchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    setLocation(`/explore?${searchParams.toString()}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-700 mb-6">
        Explore {filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}s` : "Pets"}
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <FilterSidebar 
            onFilterChange={handleFilterChange} 
            className="sticky top-4"
          />
        </aside>
        
        {/* Pet Listings */}
        <div className="lg:w-3/4">
          {/* Sort and View Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-neutral-500 mr-2">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Recommended" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <span className="text-neutral-500 mr-2">Show:</span>
                <div className="flex border border-neutral-300 rounded-md overflow-hidden">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className={viewMode === "grid" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className={viewMode === "list" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pet listings grid */}
          {isLoading ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : pets && pets.length > 0 ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
              {pets.map(pet => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  type={pet.type}
                  breed={pet.breed || ""}
                  age={pet.age || 0}
                  price={pet.price || 0}
                  image={pet.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                  location={pet.location || ""}
                  isFeatured={pet.isFeatured || false}
                  isVerified={true}
                  description={pet.description || undefined}
                  listingType={pet.listingType || undefined}
                  isFavorite={isFavorited(pet.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No pets found</h3>
              <p className="text-neutral-500 mb-4">Try adjusting your filters to find what you're looking for.</p>
              <Button 
                onClick={() => handleFilterChange({})}
                className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
              >
                Clear all filters
              </Button>
            </div>
          )}
          
          {/* Pagination */}
          {pets && pets.length > 0 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(3)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90" : ""}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => p + 1)}
                    className={pets.length < limit ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
