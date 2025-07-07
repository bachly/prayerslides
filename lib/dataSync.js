import { getCouplesFromFirebase, getCouplesAsDictionary, getDataVersion, getLocalDataVersion, setLocalDataVersion, shouldUpdateData, hasFirebaseData, migrateJsonToFirebase } from './firebase';

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

// Enhanced data synchronization - Firebase as single source of truth
export const syncDataFromFirebase = async (forceSync = false) => {
  try {
    console.log('🔄 Starting Firebase sync...');

    // Check if we need to update (unless forced)
    if (!forceSync && !(await shouldUpdateData())) {
      console.log('✅ Data is up to date, no sync needed');
      const localData = getLocalCouples();
      return {
        success: true,
        updated: false,
        data: localData,
        message: 'Data is up to date'
      };
    }

    console.log('📥 Downloading data from Firebase...');

    // Get fresh data from Firebase as dictionary
    const firebaseCouplesDict = await getCouplesAsDictionary();

    if (Object.keys(firebaseCouplesDict).length === 0) {
      console.log('⚠️ No couples data found in Firebase');
      return { success: false, error: 'No data found in Firebase' };
    }

    // Get current local data for comparison
    const localCouples = getLocalCouples();

    // Perform full sync: additions, updates, deletions
    const syncResult = performFullSync(localCouples, firebaseCouplesDict);

    // Save updated data to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPLES_STORAGE_KEY, JSON.stringify(firebaseCouplesDict));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    // Update local version
    const remoteVersion = await getDataVersion();
    setLocalDataVersion(remoteVersion.version);

    console.log(`✅ Sync complete: ${Object.keys(firebaseCouplesDict).length} couples`);
    console.log(`📊 Changes: +${syncResult.added} ~${syncResult.updated} -${syncResult.deleted}`);

    return {
      success: true,
      updated: true,
      data: firebaseCouplesDict,
      changes: syncResult,
      message: `Synced ${Object.keys(firebaseCouplesDict).length} couples`
    };

  } catch (error) {
    console.error('❌ Error syncing data from Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Perform full synchronization comparing local and remote data
const performFullSync = (localData, remoteData) => {
  const localIds = new Set(Object.keys(localData));
  const remoteIds = new Set(Object.keys(remoteData));

  // Calculate changes
  const added = [...remoteIds].filter(id => !localIds.has(id));
  const deleted = [...localIds].filter(id => !remoteIds.has(id));
  const updated = [...remoteIds].filter(id => {
    if (!localIds.has(id)) return false;
    return JSON.stringify(localData[id]) !== JSON.stringify(remoteData[id]);
  });

  console.log('🔍 Sync analysis:');
  console.log(`  ➕ Added: ${added.length} couples`);
  console.log(`  ✏️ Updated: ${updated.length} couples`);
  console.log(`  ❌ Deleted: ${deleted.length} couples`);

  // Log specific changes for debugging
  if (added.length > 0) {
    console.log('  ➕ Added couples:', added.map(id => remoteData[id]?.names).join(', '));
  }
  if (deleted.length > 0) {
    console.log('  ❌ Deleted couples:', deleted.map(id => localData[id]?.names).join(', '));
  }
  if (updated.length > 0) {
    console.log('  ✏️ Updated couples:', updated.map(id => remoteData[id]?.names).join(', '));
  }

  return {
    added: added.length,
    updated: updated.length,
    deleted: deleted.length,
    addedIds: added,
    updatedIds: updated,
    deletedIds: deleted
  };
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
    console.log(`💾 Saved ${Object.keys(couples).length} couples to local storage`);
  } catch (error) {
    console.error('Error saving local couples:', error);
  }
};

// Clear all local data (useful for fresh start)
export const clearLocalData = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(COUPLES_STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    localStorage.removeItem('dataVersion');
    clearImageCache();
    console.log('🗑️ Cleared all local data');
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};

// Validate local data integrity
export const validateLocalData = () => {
  if (typeof window === 'undefined') return { valid: false, reason: 'No window object' };

  try {
    const couples = getLocalCouples();
    const coupleIds = Object.keys(couples);

    if (coupleIds.length === 0) {
      return { valid: false, reason: 'No couples data found' };
    }

    // Check if all couples have required fields
    for (const id of coupleIds) {
      const couple = couples[id];
      if (!couple.names || !couple.location || !couple.nation || !couple.group) {
        return {
          valid: false,
          reason: `Couple ${id} missing required fields`,
          couple: couple
        };
      }
    }

    return { valid: true, count: coupleIds.length };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
};

export const getLastSyncTime = () => {
  if (typeof window === 'undefined') return null;
  
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? new Date(lastSync) : null;
};

// Auto-sync functionality with enhanced error handling
export const setupAutoSync = (onDataUpdate, intervalMinutes = 30) => {
  const syncInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds
  let consecutiveFailures = 0;
  const maxFailures = 3;

  const performAutoSync = async () => {
    try {
      console.log('🔄 Auto-sync starting...');
      const result = await syncDataFromFirebase();

      if (result.success) {
        consecutiveFailures = 0; // Reset failure count on success

        if (result.updated && onDataUpdate) {
          console.log('📱 Updating UI with new data');
          onDataUpdate(result.data);
        }
      } else {
        consecutiveFailures++;
        console.warn(`⚠️ Auto-sync failed (${consecutiveFailures}/${maxFailures}):`, result.error);

        if (consecutiveFailures >= maxFailures) {
          console.error('❌ Auto-sync disabled after multiple failures');
          return false; // Stop auto-sync
        }
      }
    } catch (error) {
      consecutiveFailures++;
      console.error(`❌ Auto-sync error (${consecutiveFailures}/${maxFailures}):`, error);

      if (consecutiveFailures >= maxFailures) {
        console.error('❌ Auto-sync disabled after multiple errors');
        return false; // Stop auto-sync
      }
    }
    return true; // Continue auto-sync
  };

  // Perform initial sync after a short delay
  setTimeout(performAutoSync, 5000);

  // Set up interval for periodic syncing
  const intervalId = setInterval(async () => {
    const shouldContinue = await performAutoSync();
    if (!shouldContinue) {
      clearInterval(intervalId);
      console.log('🛑 Auto-sync stopped due to repeated failures');
    }
  }, syncInterval);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Auto-sync stopped');
  };
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

// Initialize app data - handles migration from JSON to Firebase if needed
export const initializeAppData = async (defaultJsonCouples) => {
  try {
    console.log('🚀 Initializing app data...');

    // Check if Firebase has any data
    const hasData = await hasFirebaseData();

    if (!hasData) {
      console.log('📤 No Firebase data found, migrating from JSON...');

      // Migrate JSON data to Firebase
      const migrationResult = await migrateJsonToFirebase(defaultJsonCouples);

      if (migrationResult.success) {
        console.log(`✅ Migration successful: ${migrationResult.migrated} couples migrated`);
      } else {
        console.error('❌ Migration failed:', migrationResult.error);
        // Fall back to local JSON data
        return createLocalDataFromJson(defaultJsonCouples);
      }
    }

    // Sync data from Firebase (now that we know it has data)
    const syncResult = await syncDataFromFirebase(true);

    if (syncResult.success) {
      console.log('✅ App data initialized from Firebase');
      return {
        success: true,
        data: syncResult.data,
        source: 'firebase',
        migrated: !hasData
      };
    } else {
      console.error('❌ Failed to sync from Firebase, falling back to JSON');
      return createLocalDataFromJson(defaultJsonCouples);
    }

  } catch (error) {
    console.error('❌ Error initializing app data:', error);
    // Fall back to local JSON data
    return createLocalDataFromJson(defaultJsonCouples);
  }
};

// Create local data structure from JSON (fallback)
const createLocalDataFromJson = (jsonCouples) => {
  console.log('📁 Creating local data from JSON fallback');

  const couplesDict = {};
  jsonCouples.forEach((couple, index) => {
    const id = `local_${index}_${Date.now()}`;
    couplesDict[id] = {
      ...couple,
      id
    };
  });

  // Save to local storage
  saveLocalCouples(couplesDict);

  return {
    success: true,
    data: couplesDict,
    source: 'json',
    migrated: false
  };
};

// Migration helper for existing local data (legacy function)
export const migrateLocalDataToFirebase = async (localCouples) => {
  try {
    console.log('Migrating local data to Firebase...');

    const couplesArray = Object.values(localCouples).map(couple => {
      // Remove local ID and return clean data
      const { id, ...coupleData } = couple;
      return coupleData;
    });

    const result = await migrateJsonToFirebase(couplesArray);
    return result;
  } catch (error) {
    console.error('Error migrating data to Firebase:', error);
    return { success: false, error: error.message };
  }
};
