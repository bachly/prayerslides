import React from "react";
import Slide from "../components/Slide"
import AdminLoginModal from "../components/AdminLoginModal"
import AdminPanel from "../components/AdminPanel"
import generateSlides from "../lib/generateSlides"
import defaultCouples from "../public/files/couples.json"
import { nanoid } from "nanoid";
import _ from "underscore";
import { AiOutlineSetting, AiOutlineSync, AiOutlineWifi } from "react-icons/ai";
import { MdSignalWifiOff } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { syncDataFromFirebase, getLocalCouples, saveLocalCouples, setupAutoSync, initializeAppData } from "../lib/dataSync";

const LAST_UPDATE = "31/12/2023";

export default function Homepage() {
    const { isAdmin } = useAuth();
    const [couples, setCouples] = React.useState();
    const [downloaded, setDownloaded] = React.useState(null);
    const [slides, setSlides] = React.useState();
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [showAdminPanel, setShowAdminPanel] = React.useState(false);
    const [syncStatus, setSyncStatus] = React.useState('idle'); // idle, syncing, success, error
    const [isOnline, setIsOnline] = React.useState(true);
    const [lastSync, setLastSync] = React.useState(null);
    const [dataSource, setDataSource] = React.useState('loading'); // 'loading', 'firebase', 'json'
    const [initializationStatus, setInitializationStatus] = React.useState('Initializing...');

    function markAsDownloaded(slideId) {
        return (event) => {
            event && event.preventDefault();
            console.log(`Downloaded slide ${slideId}`)
            setDownloaded({
                ...downloaded,
                [slideId]: true
            })
        }
    }

    const handleManualSync = async () => {
        if (!isOnline) {
            alert('Cannot sync while offline');
            return;
        }

        setSyncStatus('syncing');
        try {
            const result = await syncDataFromFirebase(true);
            if (result.success && result.updated) {
                setCouples(result.data);
                setLastSync(new Date());
                setSyncStatus('success');
            } else {
                setSyncStatus('idle');
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
            setSyncStatus('error');
        }

        // Reset status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
    };

    const handleDataUpdate = async () => {
        // Refresh data after admin changes
        const result = await syncDataFromFirebase(true);
        if (result.success && result.data) {
            setCouples(result.data);
            setLastSync(new Date());
        }
    };

    const handleSettingsClick = () => {
        if (isAdmin) {
            setShowAdminPanel(!showAdminPanel);
        } else {
            setShowLoginModal(true);
        }
    };

    const handleLoginSuccess = () => {
        setShowAdminPanel(true);
    };

    // Initialize data with Firebase-first approach
    React.useEffect(function initializeData() {
        const downloaded = JSON.parse(window.localStorage.getItem('downloaded') || 'null');
        setDownloaded(downloaded);

        // Check online status
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initialize app data (Firebase-first with JSON fallback)
        const initializeAppDataAsync = async () => {
            try {
                setInitializationStatus('Checking Firebase connection...');

                const initResult = await initializeAppData(defaultCouples);

                if (initResult.success) {
                    setCouples(initResult.data);
                    setDataSource(initResult.source);
                    setLastSync(new Date());

                    if (initResult.migrated) {
                        setInitializationStatus('Migrated data to Firebase successfully');
                    } else {
                        setInitializationStatus(`Loaded from ${initResult.source}`);
                    }

                    console.log(`✅ App initialized from ${initResult.source}`);
                } else {
                    setInitializationStatus('Failed to initialize data');
                    console.error('❌ Failed to initialize app data');
                }
            } catch (error) {
                console.error('❌ Error during initialization:', error);
                setInitializationStatus('Initialization error - using local data');

                // Emergency fallback to JSON data
                const couplesDict = {}
                defaultCouples.forEach((couple) => {
                    const id = nanoid();
                    couplesDict[id] = {
                        ...couple,
                        id
                    };
                });
                setCouples(couplesDict);
                setDataSource('json');
            }
        };

        initializeAppDataAsync();

        // Setup auto-sync if online and using Firebase
        let cleanupAutoSync;
        const setupAutoSyncIfNeeded = () => {
            if (navigator.onLine && dataSource === 'firebase') {
                cleanupAutoSync = setupAutoSync((newData) => {
                    setCouples(newData);
                    setLastSync(new Date());
                });
            }
        };

        // Delay auto-sync setup to allow initialization to complete
        setTimeout(setupAutoSyncIfNeeded, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (cleanupAutoSync) cleanupAutoSync();
        };
    }, [])

    React.useEffect(function saveToLocalStorage() {
        if (downloaded) {
            window.localStorage.setItem('downloaded', JSON.stringify(downloaded));
        }

        if (couples) {
            window.localStorage.setItem('couples', JSON.stringify(couples));
        }
    }, [downloaded, couples])

    React.useEffect(function regenerateSlides() {
        if (couples && Object.keys(couples).length > 0) {
            console.log('🎯 Regenerating slides from Firebase data...');

            // Group couples by their group property
            const group1 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'local') {
                    return couples[id];
                }
            }));
            const group2 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'national') {
                    return couples[id];
                }
            }));
            const group3 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'international') {
                    return couples[id];
                }
            }));

            console.log(`📊 Groups: Local(${group1.length}), National(${group2.length}), International(${group3.length})`);

            if (group1.length > 0 && group2.length > 0 && group3.length > 0) {
                const newSlides = generateSlides(group1, group2, group3);
                setSlides(newSlides);
                console.log(`✅ Generated ${newSlides.length} slides from Firebase data`);
            } else {
                console.warn('⚠️ Missing couples in one or more groups:', {
                    local: group1.length,
                    national: group2.length,
                    international: group3.length
                });
                setSlides([]);
            }
        } else {
            console.log('⏳ Waiting for couples data...');
            setSlides([]);
        }
    }, [couples])

    function updateCouple({ id, names, surname, location, nation }) {
        setCouples({
            ...couples,
            [id]: {
                ...couples[id],
                names,
                surname,
                location,
                nation
            }
        })
    }

    return <div className="">
        <div className="flex items-start bg-neutral-900">
            <main className="flex-1">
                <div className="bg-neutral-900/60 py-4 px-12 backdrop-blur-lg fixed top-0 left-0 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-neutral-200 text-2xl">
                                Prayer Slides for ~{slides && (slides.length / 12).toFixed(0)} months
                            </div>
                            <div className="text-base text-neutral-400">
                                Last update: {LAST_UPDATE}
                                {lastSync && (
                                    <span className="ml-4">
                                        • Last sync: {lastSync.toLocaleTimeString()}
                                    </span>
                                )}
                                {dataSource !== 'loading' && (
                                    <span className="ml-4">
                                        • Source: {dataSource === 'firebase' ? '☁️ Firebase' : '📁 Local JSON'}
                                    </span>
                                )}
                                {dataSource === 'loading' && (
                                    <span className="ml-4 text-yellow-400">
                                        • {initializationStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Online/Offline Status */}
                            <div className="flex items-center text-neutral-400">
                                {isOnline ? (
                                    <AiOutlineWifi className="text-green-400" size={20} />
                                ) : (
                                    <MdSignalWifiOff className="text-red-400" size={20} />
                                )}
                            </div>

                            {/* Sync Button */}
                            <button
                                onClick={handleManualSync}
                                disabled={!isOnline || syncStatus === 'syncing' || dataSource === 'loading' || dataSource === 'json'}
                                className={`p-2 rounded-md transition-colors ${
                                    syncStatus === 'syncing'
                                        ? 'text-blue-400 animate-spin'
                                        : syncStatus === 'success'
                                        ? 'text-green-400'
                                        : syncStatus === 'error'
                                        ? 'text-red-400'
                                        : dataSource === 'firebase'
                                        ? 'text-neutral-400 hover:text-neutral-200'
                                        : 'text-neutral-600'
                                } ${(!isOnline || dataSource !== 'firebase') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={
                                    dataSource === 'loading' ? 'Initializing...' :
                                    dataSource === 'json' ? 'Using local data - Firebase not available' :
                                    !isOnline ? 'Offline - Cannot sync' :
                                    'Sync with Firebase'
                                }
                            >
                                <AiOutlineSync size={20} />
                            </button>

                            {/* Settings/Admin Button */}
                            <button
                                onClick={handleSettingsClick}
                                className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-md hover:bg-neutral-800"
                                title={isAdmin ? 'Admin Panel' : 'Admin Login'}
                            >
                                <AiOutlineSetting size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-20 p-8 flex flex-wrap justify-center">
                    {slides && slides.map((slide, index) => {
                        return <div key={`slide=${index}`} className="mr-12 mb-12">
                            <Slide
                                id={slide.id}
                                bgImageName={slide.bgImageName}
                                scale={1}
                                location1={`${slide.location1}`}
                                location2={`${slide.location2}`}
                                location3={`${slide.location3}`}
                                nation1={`${slide.nation1}`}
                                nation2={`${slide.nation2}`}
                                nation3={`${slide.nation3}`}
                                name1={`${slide.name1}`}
                                name2={`${slide.name2}`}
                                name3={`${slide.name3}`}
                                surname1={`${slide.surname1}`}
                                surname2={`${slide.surname2}`}
                                surname3={`${slide.surname3}`}
                                id1={`${slide.id1}`}
                                id2={`${slide.id2}`}
                                id3={`${slide.id3}`}
                                isDownloaded={downloaded && downloaded[slide.id]}
                                onDownload={markAsDownloaded(slide.id)}
                                onUpdate={updateCouple}
                            />
                        </div>
                    })}
                </div>
            </main>
        </div>

        {/* Admin Login Modal */}
        <AdminLoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
        />

        {/* Admin Panel */}
        {showAdminPanel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <button
                            onClick={() => setShowAdminPanel(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-4">
                        <AdminPanel couples={couples} onDataUpdate={handleDataUpdate} />
                    </div>
                </div>
            </div>
        )}
    </div>
}