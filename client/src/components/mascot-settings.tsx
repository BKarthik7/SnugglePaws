import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMascotPreferences } from "@/lib/mascot-store";

export default function MascotSettings() {
  const { isVisible, showMascot, resetSeenTips } = useMascotPreferences();
  const [showMenu, setShowMenu] = useState(false);

  // Don't show the reset button if the mascot is already visible
  if (isVisible) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-6 z-40">
      <div className="relative">
        {/* Settings button */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-white shadow-md border-[#FF8C69]/30 hover:bg-[#FF8C69]/10"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Settings className="h-5 w-5 text-[#FF8C69]" />
        </Button>

        {/* Settings menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-12 right-0 mb-2 w-44 bg-white shadow-xl rounded-lg p-2"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  showMascot();
                  setShowMenu(false);
                }}
              >
                <Dog className="mr-2 h-4 w-4" />
                <span>Show Buddy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  resetSeenTips();
                  showMascot();
                  setShowMenu(false);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Reset all tips</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}