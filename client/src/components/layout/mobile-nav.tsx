import { Link, useLocation } from "wouter";
import { Home, Search, Heart, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: unreadMessages } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread'],
    enabled: !!user,
  });
  
  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Explore", icon: Search, href: "/explore" },
    { name: "Favorites", icon: Heart, href: "/favorites" },
    { name: "Messages", icon: Mail, href: "/messages", badge: unreadMessages?.count },
    { name: "Profile", icon: User, href: "/profile" },
  ];
  
  if (!user) {
    // Remove favorites and messages for non-authenticated users
    navItems.splice(2, 2);
  }
  
  return (
    <div className="md:hidden bg-white shadow-md fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className={`flex flex-col items-center px-3 py-1 ${
              location === item.href ? "text-[#FF8C69]" : "text-neutral-500"
            }`}>
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#F44336] hover:bg-[#F44336] h-4 w-4 p-0 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
