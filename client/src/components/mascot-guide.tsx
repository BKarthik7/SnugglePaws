import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { X, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMascotPreferences } from "@/lib/mascot-store";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tip {
  id: string;
  page: string;
  message: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export default function MascotGuide() {
  const [location] = useLocation();
  const { isVisible, seenTips, hideMascot, markTipAsSeen } = useMascotPreferences();
  const [activeTip, setActiveTip] = useState<Tip | null>(null);
  const [tipMinimized, setTipMinimized] = useState(false);
  const isMobile = useIsMobile();

  // Collection of tips for different pages
  const tips: Tip[] = [
    {
      id: "home",
      page: "/",
      message: "Welcome to SnugglePaws! I'm Buddy, your pet adoption guide. Browse categories or use the search bar to find your perfect pet companion.",
      position: "bottom-right"
    },
    {
      id: "explore",
      page: "/explore",
      message: "Filter pets by type, breed, age, and more to find your ideal match. Every pet here is waiting for a loving home!",
      position: "bottom-left"
    },
    {
      id: "pet-details",
      page: "/pet/",
      message: "Here you can see detailed information about this pet. Contact the seller or save to favorites if you're interested!",
      position: "bottom-right"
    },
    {
      id: "messages",
      page: "/messages",
      message: "Chat with pet owners and sellers here. Remember to ask all important questions before proceeding with adoption.",
      position: "bottom-left"
    },
    {
      id: "profile",
      page: "/profile",
      message: "Manage your profile and view your listed pets here. Keep your information up-to-date to build trust with other users.",
      position: "bottom-right"
    },
    {
      id: "about",
      page: "/about",
      message: "Learn more about SnugglePaws and our mission to connect wonderful pets with loving homes.",
      position: "bottom-right"
    }
  ];

  // Find the appropriate tip for the current location
  useEffect(() => {
    const matchingTip = tips.find(tip => 
      location === tip.page || 
      (tip.page !== "/" && location.startsWith(tip.page))
    );
    
    if (matchingTip) {
      setActiveTip(matchingTip);
      // Only show the tip if it hasn't been seen yet or if we're on the home page
      // (Home page tip always shows unless minimized)
      const shouldMinimize = matchingTip.id !== "home" && seenTips.includes(matchingTip.id);
      setTipMinimized(shouldMinimize);
    } else {
      setActiveTip(null);
    }
  }, [location, seenTips]);

  // Hide mascot completely
  const handleClose = () => {
    hideMascot();
  };

  // Minimize the tip but keep mascot visible
  const handleMinimize = () => {
    if (activeTip) {
      markTipAsSeen(activeTip.id);
    }
    setTipMinimized(true);
  };

  // Show the tip again when minimized
  const handleReshow = () => {
    setTipMinimized(false);
  };

  // Don't show anything if hidden
  if (!isVisible) return null;

  return (
    <div className="fixed z-50 flex flex-col items-end gap-4">
      {/* Position the mascot and tip based on the position property */}
      <div className={`
        ${activeTip?.position === "bottom-right" || !activeTip ? "bottom-24 sm:bottom-6 right-6" : ""}
        ${activeTip?.position === "bottom-left" ? "bottom-24 sm:bottom-6 left-6" : ""}
        ${activeTip?.position === "top-right" ? "top-20 right-6" : ""}
        ${activeTip?.position === "top-left" ? "top-20 left-6" : ""}
        fixed flex items-end gap-4
      `}>
        {/* Mascot Character */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="cursor-pointer"
            onClick={tipMinimized ? handleReshow : undefined}
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-[#FF8C69] to-[#FF5349] shadow-lg border-2 border-white">
              {/* Mascot Image - Cute Dog */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z"/>
                </svg>
              </div>
              
              {/* Close button */}
              <button 
                onClick={handleClose}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white shadow flex items-center justify-center text-neutral-500 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* Add a subtle pulse effect */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-white"
                initial={{ opacity: 0.3, scale: 1 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3], 
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ zIndex: -1 }}
              />
            </div>
          </motion.div>
          
          {/* Speech bubble animation */}
          <AnimatePresence>
            {activeTip && !tipMinimized && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${
                  isMobile 
                    ? "top-auto bottom-full left-1/2 -translate-x-1/2 mb-3" 
                    : `${activeTip.position.includes("right") ? "right-full mr-3" : "left-full ml-3"} bottom-0`
                } mb-2 w-64 md:w-72 max-w-[calc(100vw-4rem)] z-50`}
              >
                <Card className="shadow-lg border-[#FF8C69]/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FF8C69]/20 to-[#FF8C69]/10 py-1.5 px-4 flex items-center border-b border-[#FF8C69]/10">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#FF8C69]/40"></div>
                      <div className="h-2 w-2 rounded-full bg-[#FF8C69]/60"></div>
                      <div className="h-2 w-2 rounded-full bg-[#FF8C69]/80"></div>
                    </div>
                    <p className="text-xs font-medium text-[#FF8C69] ml-auto">Buddy says...</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <MessageCircle className="h-5 w-5 text-[#FF8C69] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">{activeTip.message}</p>
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-[#FF8C69] hover:text-[#FF8C69] hover:bg-[#FF8C69]/10"
                            onClick={handleMinimize}
                          >
                            <span className="mr-1">✓</span> Got it!
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Speech bubble triangle */}
                <div 
                  className={`absolute ${
                    isMobile
                      ? "left-1/2 -translate-x-1/2 -mb-2 bottom-0"
                      : `${activeTip.position.includes("right") ? "right-0 -mr-2" : "left-0 -ml-2"} bottom-4`
                  } w-0 h-0 border-8 border-transparent ${
                    isMobile
                      ? "border-t-white"
                      : activeTip.position.includes("right") ? "border-l-white" : "border-r-white"
                  }`}
                ></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}