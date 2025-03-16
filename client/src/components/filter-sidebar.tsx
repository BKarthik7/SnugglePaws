import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface FilterSidebarProps {
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
}

export default function FilterSidebar({ onFilterChange, className = "" }: FilterSidebarProps) {
  const [, setLocation] = useLocation();
  
  // Filter states
  const [petTypes, setPetTypes] = useState<string[]>(["dog", "cat"]);
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [distance, setDistance] = useState<string>("any");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sources, setSources] = useState<string[]>([]);
  
  const handlePetTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setPetTypes([...petTypes, type]);
    } else {
      setPetTypes(petTypes.filter(t => t !== type));
    }
  };
  
  const handleAgeRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setAgeRanges([...ageRanges, range]);
    } else {
      setAgeRanges(ageRanges.filter(r => r !== range));
    }
  };
  
  const handleSourceChange = (source: string, checked: boolean) => {
    if (checked) {
      setSources([...sources, source]);
    } else {
      setSources(sources.filter(s => s !== source));
    }
  };
  
  const applyFilters = () => {
    const filters: Record<string, any> = {};
    
    if (petTypes.length > 0 && petTypes.length < 2) {
      filters.type = petTypes[0];
    }
    
    if (ageRanges.length > 0) {
      // Convert age ranges to actual min/max values
      // This is simplified for demo purposes
      if (ageRanges.includes("puppy")) {
        filters.maxAge = 12; // 0-1 year in months
      }
      if (ageRanges.includes("young")) {
        if (!filters.minAge || filters.minAge > 12) filters.minAge = 13;
        if (!filters.maxAge || filters.maxAge < 36) filters.maxAge = 36;
      }
      if (ageRanges.includes("adult")) {
        if (!filters.minAge || filters.minAge > 37) filters.minAge = 37;
        if (!filters.maxAge || filters.maxAge < 96) filters.maxAge = 96;
      }
      if (ageRanges.includes("senior")) {
        if (!filters.minAge) filters.minAge = 97; // 8+ years in months
      }
    }
    
    if (distance !== "any") {
      filters.distance = distance;
    }
    
    if (minPrice) {
      filters.minPrice = minPrice;
    }
    
    if (maxPrice) {
      filters.maxPrice = maxPrice;
    }
    
    if (sources.length > 0) {
      if (sources.includes("breeder")) {
        filters.listingType = "sale";
      } else if (sources.includes("shelter")) {
        filters.listingType = "adoption";
      } else if (sources.includes("owner")) {
        filters.listingType = "rehome";
      }
    }
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange(filters);
    } else {
      // If no callback is provided, redirect to explore page with filters as query params
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      setLocation(`/explore?${searchParams.toString()}`);
    }
  };
  
  const resetFilters = () => {
    setPetTypes(["dog", "cat"]);
    setAgeRanges([]);
    setDistance("any");
    setMinPrice("");
    setMaxPrice("");
    setSources([]);
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };
  
  useEffect(() => {
    // Apply filters when component mounts to initialize the view
    if (onFilterChange) {
      applyFilters();
    }
  }, []);
  
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-4">Filters</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-700 mb-2">Type of Pet</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dog" 
                checked={petTypes.includes("dog")} 
                onCheckedChange={(checked) => handlePetTypeChange("dog", checked as boolean)}
              />
              <Label htmlFor="dog">Dogs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat" 
                checked={petTypes.includes("cat")} 
                onCheckedChange={(checked) => handlePetTypeChange("cat", checked as boolean)}
              />
              <Label htmlFor="cat">Cats</Label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-700 mb-2">Age</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="puppy" 
                checked={ageRanges.includes("puppy")} 
                onCheckedChange={(checked) => handleAgeRangeChange("puppy", checked as boolean)}
              />
              <Label htmlFor="puppy">Puppy/Kitten (0-1 year)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="young" 
                checked={ageRanges.includes("young")} 
                onCheckedChange={(checked) => handleAgeRangeChange("young", checked as boolean)}
              />
              <Label htmlFor="young">Young (1-3 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="adult" 
                checked={ageRanges.includes("adult")} 
                onCheckedChange={(checked) => handleAgeRangeChange("adult", checked as boolean)}
              />
              <Label htmlFor="adult">Adult (3-8 years)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="senior" 
                checked={ageRanges.includes("senior")} 
                onCheckedChange={(checked) => handleAgeRangeChange("senior", checked as boolean)}
              />
              <Label htmlFor="senior">Senior (8+ years)</Label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-700 mb-2">Distance</h4>
          <Select value={distance} onValueChange={setDistance}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any distance</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
              <SelectItem value="50">Within 50 miles</SelectItem>
              <SelectItem value="100">Within 100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-700 mb-2">Price Range</h4>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
              min="0"
            />
            <span>-</span>
            <Input
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              min="0"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-700 mb-2">Source</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="breeder" 
                checked={sources.includes("breeder")} 
                onCheckedChange={(checked) => handleSourceChange("breeder", checked as boolean)}
              />
              <Label htmlFor="breeder">Breeders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="shelter" 
                checked={sources.includes("shelter")} 
                onCheckedChange={(checked) => handleSourceChange("shelter", checked as boolean)}
              />
              <Label htmlFor="shelter">Shelters/Rescues</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="owner" 
                checked={sources.includes("owner")} 
                onCheckedChange={(checked) => handleSourceChange("owner", checked as boolean)}
              />
              <Label htmlFor="owner">Pet Owners</Label>
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-between">
          <Button variant="ghost" onClick={resetFilters}>
            Reset All
          </Button>
          <Button onClick={applyFilters} className="bg-[#FF8C69] hover:bg-[#FF8C69]/90">
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
