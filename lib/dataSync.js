import { getCouplesFromFirebase, getDataVersion, getLocalDataVersion, setLocalDataVersion, shouldUpdateData } from './firebase';

// Local storage keys
const COUPLES_STORAGE_KEY = 'couples';
const IMAGES_CACHE_KEY = 'imageCache';
const LAST_SYNC_KEY = 'lastSync';

// Image caching utilities
export const getCachedImage = (imageName) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cache = JSON.parse(localStorage.getItem(IMAGES_CACHE_KEY) || '{}');
    return cache[imageName] || null;
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

export const setCachedImage = (imageName, imageData) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = JSON.parse(localStorage.getItem(IMAGES_CACHE_KEY) || '{}');
    cache[imageName] = {
      data: imageData,
      timestamp: Date.now()
    };
    localStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching image:', error);
  }
};

export const clearImageCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(IMAGES_CACHE_KEY);
};

// Data synchronization
export const syncDataFromFirebase = async (forceSync = false) => {
  try {
    console.log('Checking for data updates...');
    
    // Check if we need to update
    if (!forceSync && !(await shouldUpdateData())) {
      console.log('Data is up to date, no sync needed');
      return { success: true, updated: false, message: 'Data is up to date' };
    }

    console.log('Syncing data from Firebase...');
    
    // Get fresh data from Firebase
    const firebaseCouples = await getCouplesFromFirebase();
    
    if (firebaseCouples.length === 0) {
      console.log('No couples data found in Firebase');
      return { success: false, error: 'No data found in Firebase' };
    }

    // Transform Firebase data to match local format
    const couplesDict = {};
    firebaseCouples.forEach((couple) => {
      couplesDict[couple.id] = couple;
    });

    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPLES_STORAGE_KEY, JSON.stringify(couplesDict));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    // Update local version
    const remoteVersion = await getDataVersion();
    setLocalDataVersion(remoteVersion.version);

    console.log(`Synced ${firebaseCouples.length} couples from Firebase`);
    
    return { 
      success: true, 
      updated: true, 
      data: couplesDict,
      message: `Synced ${firebaseCouples.length} couples` 
    };
    
  } catch (error) {
    console.error('Error syncing data from Firebase:', error);
    return { success: false, error: error.message };
  }
};

export const getLocalCouples = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(COUPLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting local couples:', error);
    return {};
  }
};

export const saveLocalCouples = (couples) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COUPLES_STORAGE_KEY, JSON.stringify(couples));
  } catch (error) {
    console.error('Error saving local couples:', error);
  }
};

export const getLastSyncTime = () => {
  if (typeof window === 'undefined') return null;
  
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? new Date(lastSync) : null;
};

// Auto-sync functionality
export const setupAutoSync = (onDataUpdate, intervalMinutes = 30) => {
  const syncInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds
  
  const performAutoSync = async () => {
    try {
      const result = await syncDataFromFirebase();
      if (result.success && result.updated && onDataUpdate) {
        onDataUpdate(result.data);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  // Perform initial sync
  performAutoSync();

  // Set up interval for periodic syncing
  const intervalId = setInterval(performAutoSync, syncInterval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Image downloading and caching
export const downloadAndCacheImage = async (imageUrl, imageName) => {
  try {
    // Check if already cached
    const cached = getCachedImage(imageName);
    if (cached) {
      return cached.data;
    }

    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const base64Data = reader.result;
        setCachedImage(imageName, base64Data);
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error('Error downloading and caching image:', error);
    return null;
  }
};

// Batch image caching
export const cacheAllImages = async (couples, onProgress) => {
  const couplesList = Object.values(couples);
  const total = couplesList.length;
  let completed = 0;

  for (const couple of couplesList) {
    if (couple.imageUrl && couple.bgImageName) {
      try {
        await downloadAndCacheImage(couple.imageUrl, couple.bgImageName);
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
      } catch (error) {
        console.error(`Failed to cache image for ${couple.names}:`, error);
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
      }
    } else {
      completed++;
      if (onProgress) {
        onProgress(completed, total);
      }
    }
  }
};

// Migration helper for existing data
export const migrateLocalDataToFirebase = async (localCouples) => {
  try {
    console.log('Migrating local data to Firebase...');
    
    const results = [];
    for (const couple of Object.values(localCouples)) {
      // Remove local ID and add to Firebase
      const { id, ...coupleData } = couple;
      const result = await addCoupleToFirebase(coupleData);
      results.push(result);
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`Migrated ${successful}/${results.length} couples to Firebase`);
    
    return { success: true, migrated: successful, total: results.length };
  } catch (error) {
    console.error('Error migrating data to Firebase:', error);
    return { success: false, error: error.message };
  }
};
