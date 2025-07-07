import React, { useState, useEffect } from 'react';
import { AiOutlineImport, AiOutlineExport, AiOutlineHistory, AiOutlineClose } from 'react-icons/ai';

export default function ImportExportControls({ onDataUpdate }) {
    const [showBackups, setShowBackups] = useState(false);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load available backups when component mounts or when backup modal opens
    useEffect(() => {
        if (showBackups) {
            loadBackups();
        }
    }, [showBackups]);

    const loadBackups = async () => {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.getAvailableBackups();
                if (result.success) {
                    setBackups(result.backups);
                } else {
                    setMessage('Error loading backups: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Error loading backups:', error);
            setMessage('Error loading backups');
        }
    };

    const handleImport = async () => {
        try {
            setLoading(true);
            setMessage('');

            if (!window.electronAPI) {
                setMessage('Import not available in web version');
                return;
            }

            // Show file dialog
            const result = await window.electronAPI.showOpenDialog({
                title: 'Import Prayer Slides Data',
                filters: [
                    { name: 'Zip Files', extensions: ['zip'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                
                // Import the zip file
                const importResult = await window.electronAPI.importDataZip(filePath);
                
                if (importResult.success) {
                    setMessage('Data imported successfully! Please restart the app to see changes.');
                    if (onDataUpdate) {
                        onDataUpdate();
                    }
                } else {
                    setMessage('Import failed: ' + importResult.error);
                }
            }
        } catch (error) {
            console.error('Error importing data:', error);
            setMessage('Error importing data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            setMessage('');

            if (!window.electronAPI) {
                setMessage('Export not available in web version');
                return;
            }

            const result = await window.electronAPI.exportDataZip();
            
            if (result.success) {
                setMessage(`Data exported successfully to: ${result.filePath}`);
            } else {
                setMessage('Export failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            setMessage('Error exporting data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreBackup = async (backupPath) => {
        try {
            setLoading(true);
            setMessage('');

            const result = await window.electronAPI.restoreFromBackup(backupPath);
            
            if (result.success) {
                setMessage('Backup restored successfully! Please restart the app to see changes.');
                setShowBackups(false);
                if (onDataUpdate) {
                    onDataUpdate();
                }
            } else {
                setMessage('Restore failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            setMessage('Error restoring backup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch {
            return dateString;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="flex gap-2">
                {/* Import Button */}
                <button
                    onClick={handleImport}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Import Prayer Slides Data"
                >
                    <AiOutlineImport size={20} />
                    Import
                </button>

                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Export Prayer Slides Data"
                >
                    <AiOutlineExport size={20} />
                    Export
                </button>

                {/* Backups Button */}
                <button
                    onClick={() => setShowBackups(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="View Backups"
                >
                    <AiOutlineHistory size={20} />
                    Backups
                </button>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`mt-2 p-3 rounded-lg text-sm max-w-md ${
                    message.includes('successfully') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            {/* Backups Modal */}
            {showBackups && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Available Backups</h2>
                            <button
                                onClick={() => setShowBackups(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <AiOutlineClose size={24} />
                            </button>
                        </div>

                        {backups.length === 0 ? (
                            <p className="text-gray-600">No backups available</p>
                        ) : (
                            <div className="space-y-3">
                                {backups.map((backup, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    Backup #{backups.length - index}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Created: {formatDate(backup.date)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Size: {formatFileSize(backup.size)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRestoreBackup(backup.path)}
                                                disabled={loading}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-sm text-gray-600">
                            <p>• Only the last 3 backups are kept automatically</p>
                            <p>• Backups are created when importing new data</p>
                            <p>• Restoring will create a backup of current data</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
