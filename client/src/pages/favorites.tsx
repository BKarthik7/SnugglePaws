import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Pet } from "@shared/schema";
import PetCard from "@/components/pet-card";
import { apiRequest } from "@/lib/queryClient";

export default function Favorites() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch user's favorite pets
  const { data: favorites, isLoading } = useQuery<Pet[]>({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/favorites');
      return response as Pet[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-neutral-800">My Favorites</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-[350px] bg-neutral-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((pet) => (
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
              listingType={pet.listingType}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="mb-4 text-[#FF8C69]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-neutral-700 mb-2">No Favorites Yet</h3>
          <p className="text-neutral-500 mb-6">You haven't added any pets to your favorites yet.</p>
          <button 
            className="px-4 py-2 bg-[#FF8C69] text-white rounded-md hover:bg-[#FF8C69]/90 transition-colors"
            onClick={() => navigate("/explore")}
          >
            Explore Pets
          </button>
        </div>
      )}
    </div>
  );
}