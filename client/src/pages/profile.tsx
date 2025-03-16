import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PetCard from "@/components/pet-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  location: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// New pet listing schema
const petSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  type: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  age: z.coerce.number().min(0, "Age must be a positive number").optional(),
  gender: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number").optional(),
  location: z.string().min(1, "Location is required"),
  listingType: z.string().min(1, "Listing type is required"),
  images: z.array(z.string()).optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch user's pets
  const { data: userPets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ['/api/pets', { sellerId: user.id }],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/pets?sellerId=${user.id}`);
      return response as Pet[];
    },
  });

  // Fetch user's favorite pets
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<Pet[]>({
    queryKey: ['/api/favorites'],
  });

  // Set up profile update form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      location: user.location || "",
      bio: user.bio || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PUT", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "Please try again later",
      });
    },
  });

  // Set up new pet form
  const newPetForm = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      type: "dog",
      breed: "",
      age: undefined,
      gender: "",
      size: "",
      description: "",
      price: undefined,
      location: user.location || "",
      listingType: "sale",
      images: ["https://via.placeholder.com/500x300?text=Add+Pet+Image"],
    },
  });

  // Add new pet mutation
  const addPetMutation = useMutation({
    mutationFn: async (data: PetFormValues) => {
      await apiRequest("POST", "/api/pets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets', { sellerId: user.id }] });
      newPetForm.reset();
      setActiveTab("my-pets");
      toast({
        title: "Pet added",
        description: "Your pet listing has been successfully created",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add pet",
        description: error.message || "Please try again later",
      });
    },
  });

  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      await apiRequest("DELETE", `/api/pets/${petId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets', { sellerId: user.id }] });
      toast({
        title: "Pet deleted",
        description: "Your pet listing has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete pet",
        description: error.message || "Please try again later",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle new pet form submission
  const onNewPetSubmit = (data: PetFormValues) => {
    addPetMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-neutral-500 capitalize mb-2">
                  {user.userType.replace('_', ' ')}
                </p>
                {user.isVerified && (
                  <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50] text-white">
                    Verified
                  </Badge>
                )}
                {user.location && (
                  <p className="text-sm text-neutral-500 mt-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <nav className="flex flex-col space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className={activeTab === "profile" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90 justify-start" : "justify-start"}
                  onClick={() => setActiveTab("profile")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "my-pets" ? "default" : "ghost"} 
                  className={activeTab === "my-pets" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90 justify-start" : "justify-start"}
                  onClick={() => setActiveTab("my-pets")}
                  disabled={user.userType === "pet_seeker"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224z"/>
                  </svg>
                  My Pets
                </Button>
                <Button 
                  variant={activeTab === "add-pet" ? "default" : "ghost"} 
                  className={activeTab === "add-pet" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90 justify-start" : "justify-start"}
                  onClick={() => setActiveTab("add-pet")}
                  disabled={user.userType === "pet_seeker"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Pet
                </Button>
                <Button 
                  variant={activeTab === "favorites" ? "default" : "ghost"} 
                  className={activeTab === "favorites" ? "bg-[#FF8C69] hover:bg-[#FF8C69]/90 justify-start" : "justify-start"}
                  onClick={() => setActiveTab("favorites")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </Button>
              </nav>

              <Separator className="my-4" />

              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={logout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            City, State or Area
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[120px]" 
                              placeholder="Tell us about yourself or your organization..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* My Pets Tab */}
          {activeTab === "my-pets" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-700">My Pet Listings</h2>
                <Button 
                  className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                  onClick={() => setActiveTab("add-pet")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Pet
                </Button>
              </div>

              {isLoadingPets ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : userPets && userPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPets.map((pet) => (
                    <div key={pet.id} className="relative">
                      <PetCard
                        id={pet.id}
                        name={pet.name}
                        type={pet.type}
                        breed={pet.breed || ""}
                        age={pet.age || 0}
                        price={pet.price || 0}
                        image={pet.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                        location={pet.location || ""}
                        isFeatured={pet.isFeatured || false}
                        isVerified={user.isVerified}
                        description={pet.description}
                        listingType={pet.listingType}
                      />
                      <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Implement edit functionality
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the listing for {pet.name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => deletePetMutation.mutate(pet.id)}
                              >
                                {deletePetMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="mb-4 text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 512 512">
                        <path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-700 mb-2">No Pet Listings Yet</h3>
                    <p className="text-neutral-500 mb-6">You haven't added any pets to your profile yet.</p>
                    <Button 
                      className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                      onClick={() => setActiveTab("add-pet")}
                    >
                      Add Your First Pet
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Add Pet Tab */}
          {activeTab === "add-pet" && (
            <Card>
              <CardHeader>
                <CardTitle>Add a New Pet</CardTitle>
                <CardDescription>
                  Create a new listing for a pet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...newPetForm}>
                  <form onSubmit={newPetForm.handleSubmit(onNewPetSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={newPetForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Max" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Type</FormLabel>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="dog">Dog</option>
                              <option value="cat">Cat</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="breed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breed</FormLabel>
                            <FormControl>
                              <Input placeholder="Golden Retriever" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (in months)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="12" {...field} />
                            </FormControl>
                            <FormDescription>
                              E.g. 3 for 3 months, 12 for 1 year, 24 for 2 years
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select size</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="500" {...field} />
                            </FormControl>
                            <FormDescription>
                              Set to 0 for adoption/rehoming if no fee
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Seattle, WA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Type</FormLabel>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="sale">For Sale</option>
                              <option value="adoption">Adoption</option>
                              <option value="rehome">Rehoming</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newPetForm.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Pet Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/pet-image.jpg" 
                                value={field.value?.[0] || ""} 
                                onChange={(e) => field.onChange([e.target.value])} 
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a URL for your pet's image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={newPetForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[120px]" 
                              placeholder="Describe your pet's personality, history, training level, and any special needs..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                      disabled={addPetMutation.isPending}
                    >
                      {addPetMutation.isPending ? "Creating Listing..." : "Create Listing"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-700 mb-6">My Favorite Pets</h2>
              
              {isLoadingFavorites ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      isFeatured={pet.isFeatured || false}
                      isVerified={true}
                      description={pet.description}
                      listingType={pet.listingType}
                      isFavorite={true}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="mb-4 text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-700 mb-2">No Favorites Yet</h3>
                    <p className="text-neutral-500 mb-6">You haven't added any pets to your favorites yet.</p>
                    <Button 
                      className="bg-[#FF8C69] hover:bg-[#FF8C69]/90"
                      onClick={() => navigate("/explore")}
                    >
                      Explore Pets
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
