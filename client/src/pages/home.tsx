import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Pet } from "@shared/schema";
import PetCard from "@/components/pet-card";
import CategoryCard from "@/components/category-card";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  
  // Fetch featured pets
  const { data: featuredPets, isLoading: isFeaturedLoading } = useQuery<Pet[]>({
    queryKey: ['/api/pets', { isFeatured: true, limit: 4 }],
  });
  
  // Fetch perfect matches (pets that might interest the user)
  const { data: perfectMatches, isLoading: isMatchesLoading } = useQuery<Pet[]>({
    queryKey: ['/api/pets', { limit: 4 }],
  });
  
  // Categories data
  const categories = [
    { 
      name: "Dogs",
      count: 1245,
      imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      href: "/explore?type=dog"
    },
    { 
      name: "Cats",
      count: 978,
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      href: "/explore?type=cat"
    },
    { 
      name: "Puppies",
      count: 536,
      imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      href: "/explore?type=dog&maxAge=12"
    },
    { 
      name: "Kittens",
      count: 412,
      imageUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
      href: "/explore?type=cat&maxAge=12"
    }
  ];
  
  // Get user favorites to check if a pet is favorited
  const { data: favorites } = useQuery<Pet[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });
  
  const isFavorited = (petId: number) => {
    return favorites?.some(pet => pet.id === petId) ?? false;
  };
  
  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative bg-[#5CA9DD]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C69]/70 to-[#5CA9DD]/70"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Find Your Perfect Furry Companion
            </h1>
            <p className="text-white text-lg mb-8">
              Connect with trusted breeders, shelters, and pet owners looking for loving homes.
            </p>
            
            {/* Search Bar */}
            <SearchBar />
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Featured Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-700 mb-6">Browse By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <CategoryCard 
                key={index}
                name={category.name}
                count={category.count}
                imageUrl={category.imageUrl}
                href={category.href}
              />
            ))}
          </div>
        </section>
        
        {/* Perfect Matches Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-700">Your Perfect Matches</h2>
            <Link href="/explore" className="text-[#FF8C69] font-semibold">
              View all
            </Link>
          </div>
          
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex space-x-4 pb-4">
              {isMatchesLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
                ))
              ) : (
                perfectMatches?.map(pet => (
                  <div key={pet.id} className="flex-shrink-0 w-64">
                    <PetCard
                      id={pet.id}
                      name={pet.name}
                      type={pet.type}
                      breed={pet.breed || ""}
                      age={pet.age || 0}
                      price={pet.price || 0}
                      image={pet.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                      location={pet.location || ""}
                      isPerfectMatch={true}
                      isVerified={true}
                      isFavorite={isFavorited(pet.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Featured Pets Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-700">Featured Pets</h2>
            <Link href="/explore?isFeatured=true" className="text-[#FF8C69] font-semibold">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isFeaturedLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
              ))
            ) : (
              featuredPets?.map(pet => (
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
                  isFeatured={true}
                  isVerified={true}
                  description={pet.description as string | undefined}
                  listingType={pet.listingType as string | undefined}
                  isFavorite={isFavorited(pet.id)}
                />
              ))
            )}
          </div>
        </section>
        
        {/* Trust Section */}
        <section className="bg-white py-12 rounded-lg shadow-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-neutral-700 text-center mb-8">Why Choose SnugglePaws?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#FF8C69]/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Verified Sellers</h3>
                <p className="text-neutral-600">All breeders and shelters on our platform undergo a thorough verification process.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#FF8C69]/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF8C69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Perfect Match</h3>
                <p className="text-neutral-600">Our algorithm helps you find pets that match your lifestyle and preferences.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#FF8C69]/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF8C69]" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Ethical Practices</h3>
                <p className="text-neutral-600">We're committed to fighting puppy mills and promoting responsible pet ownership.</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/how-it-works">
                <Button className="bg-[#FF8C69] hover:bg-[#FF8C69]/90">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
