import React from "react";
import _ from "underscore";
import { nanoid } from "nanoid";

export default function Homepage() {
    const [couples, setCouples] = React.useState();

    React.useEffect(function loadDataFromJSON() {
        // Load couples data directly from JSON file
        async function loadCouplesData() {
            try {
                // Check if we're in Electron environment
                if (typeof window !== 'undefined' && window.electronAPI) {
                    // Load from JSON file via Electron IPC
                    const couplesFromJSON = await window.electronAPI.loadCouplesData();

                    // Get any custom couples from localStorage (user additions/modifications)
                    const customCouples = JSON.parse(window.localStorage.getItem('customCouples')) || {};

                    // Convert JSON array to dictionary format with IDs
                    const couplesDict = {};
                    couplesFromJSON.forEach((couple) => {
                        const id = nanoid();
                        couplesDict[id] = {
                            ...couple,
                            id,
                            isCustom: false // Mark as original data
                        };
                    });

                    // Merge with custom couples (preserving user customizations)
                    const mergedCouples = { ...couplesDict, ...customCouples };
                    setCouples(mergedCouples);
                } else {
                    // Fallback for web environment (shouldn't happen in Electron app)
                    console.warn('Electron API not available, using fallback');
                    setCouples({});
                }
            } catch (error) {
                console.error('Error loading couples data:', error);
                setCouples({});
            }
        }

        loadCouplesData();
    }, [])

    return <div className="bg-white">
        {JSON.stringify(couples)}
    </div>
}
