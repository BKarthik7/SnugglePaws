import { useState, useEffect } from 'react';

// Define the key for storing mascot preferences in localStorage
const MASCOT_STORAGE_KEY = 'snugglepaws_mascot_preferences';

// Define the interface for mascot preferences
interface MascotPreferences {
  isVisible: boolean;
  seenTips: string[];
}

// Default preferences
const defaultPreferences: MascotPreferences = {
  isVisible: true,
  seenTips: []
};

// Create a function to get the current preferences from storage
function getStoredPreferences(): MascotPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }
  
  try {
    const stored = localStorage.getItem(MASCOT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  } catch (error) {
    console.error('Error reading mascot preferences:', error);
    return defaultPreferences;
  }
}

// Create a function to update the preferences in storage
function updateStoredPreferences(preferences: MascotPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving mascot preferences:', error);
  }
}

// Create a hook to interact with the mascot preferences
export function useMascotPreferences() {
  const [preferences, setPreferences] = useState<MascotPreferences>(defaultPreferences);
  
  // Load preferences from storage when the component mounts
  useEffect(() => {
    setPreferences(getStoredPreferences());
  }, []);
  
  // Methods to update preferences
  const toggleMascotVisibility = () => {
    const newPreferences = {
      ...preferences,
      isVisible: !preferences.isVisible
    };
    setPreferences(newPreferences);
    updateStoredPreferences(newPreferences);
  };
  
  const hideMascot = () => {
    const newPreferences = {
      ...preferences,
      isVisible: false
    };
    setPreferences(newPreferences);
    updateStoredPreferences(newPreferences);
  };
  
  const showMascot = () => {
    const newPreferences = {
      ...preferences,
      isVisible: true
    };
    setPreferences(newPreferences);
    updateStoredPreferences(newPreferences);
  };
  
  const markTipAsSeen = (tipId: string) => {
    if (preferences.seenTips.includes(tipId)) {
      return; // Already seen
    }
    
    const newPreferences = {
      ...preferences,
      seenTips: [...preferences.seenTips, tipId]
    };
    setPreferences(newPreferences);
    updateStoredPreferences(newPreferences);
  };
  
  const resetSeenTips = () => {
    const newPreferences = {
      ...preferences,
      seenTips: []
    };
    setPreferences(newPreferences);
    updateStoredPreferences(newPreferences);
  };
  
  return {
    isVisible: preferences.isVisible,
    seenTips: preferences.seenTips,
    toggleMascotVisibility,
    hideMascot,
    showMascot,
    markTipAsSeen,
    resetSeenTips
  };
}