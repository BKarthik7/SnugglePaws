import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Mail, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  const { data: unreadMessages } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread'],
    enabled: !!user,
  });
  
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Messages", href: "/messages" },
    { name: "About", href: "/about" },
  ];
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF8C69]" fill="currentColor" viewBox="0 0 512 512">
              <path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z"/>
            </svg>
            <h1 className="text-2xl font-bold">
              <span className="text-[#FF8C69]">Snuggle</span>Paws
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={`font-semibold ${
                        location === item.href 
                          ? "text-[#FF8C69]" 
                          : "text-neutral-500 hover:text-[#FF8C69]"
                      }`}>
                        {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/favorites">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-[#FF8C69] hover:bg-transparent">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <Link href="/messages">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-[#FF8C69] hover:bg-transparent relative">
                      <Mail className="h-5 w-5" />
                      {unreadMessages && unreadMessages.count > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-[#F44336] hover:bg-[#F44336]">
                          {unreadMessages.count}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 hover:bg-transparent">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profileImage || ''} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{user.name.split(' ')[0]}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href="/profile">
                        <DropdownMenuItem>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-[#FF8C69] hover:bg-[#FF8C69]/90">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
