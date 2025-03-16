import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchBar() {
  const [, setLocation] = useLocation();
  const [petType, setPetType] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    let searchParams = new URLSearchParams();
    
    if (petType !== "all") {
      searchParams.append("type", petType);
    }
    
    if (searchLocation.trim()) {
      searchParams.append("location", searchLocation.trim());
    }
    
    const queryString = searchParams.toString();
    setLocation(`/explore${queryString ? `?${queryString}` : ''}`);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Label htmlFor="pet-type" className="block text-sm font-medium text-neutral-500 mb-1">
            Looking for
          </Label>
          <Select value={petType} onValueChange={setPetType}>
            <SelectTrigger id="pet-type" className="w-full">
              <SelectValue placeholder="Select pet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pets</SelectItem>
              <SelectItem value="dog">Dogs</SelectItem>
              <SelectItem value="cat">Cats</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="location" className="block text-sm font-medium text-neutral-500 mb-1">
            Location
          </Label>
          <Input
            id="location"
            placeholder="City, State or Zip"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>
        
        <div>
          <Button type="submit" className="w-full md:w-auto bg-[#FF8C69] hover:bg-[#FF8C69]/90">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
