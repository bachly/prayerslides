import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineUpload, AiOutlineLogout } from 'react-icons/ai';
import { useAuth } from '../contexts/AuthContext';
import { logoutAdmin, addCoupleToFirebase, updateCoupleInFirebase, deleteCoupleFromFirebase, uploadImageToFirebase } from '../lib/firebase';

const AdminPanel = ({ couples, onDataUpdate }) => {
  const { isAdmin } = useAuth();
  const [editingCouple, setEditingCouple] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
  };

  const handleAddCouple = async (coupleData) => {
    setLoading(true);
    const result = await addCoupleToFirebase(coupleData);
    if (result.success) {
      onDataUpdate();
      setShowAddForm(false);
    }
    setLoading(false);
  };

  const handleUpdateCouple = async (coupleId, coupleData) => {
    setLoading(true);
    const result = await updateCoupleInFirebase(coupleId, coupleData);
    if (result.success) {
      onDataUpdate();
      setEditingCouple(null);
    }
    setLoading(false);
  };

  const handleDeleteCouple = async (coupleId) => {
    if (confirm('Are you sure you want to delete this couple?')) {
      setLoading(true);
      const result = await deleteCoupleFromFirebase(coupleId);
      if (result.success) {
        onDataUpdate();
      }
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <AiOutlinePlus className="mr-2" />
            Add Couple
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <AiOutlineLogout className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {showAddForm && (
        <CoupleForm
          onSubmit={handleAddCouple}
          onCancel={() => setShowAddForm(false)}
          loading={loading}
          title="Add New Couple"
        />
      )}

      {editingCouple && (
        <CoupleForm
          couple={editingCouple}
          onSubmit={(data) => handleUpdateCouple(editingCouple.id, data)}
          onCancel={() => setEditingCouple(null)}
          loading={loading}
          title="Edit Couple"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(couples || {}).map((couple) => (
          <div key={couple.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{couple.names}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setEditingCouple(couple)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <AiOutlineEdit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCouple(couple.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <AiOutlineDelete size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Location: {couple.location}</p>
            <p className="text-sm text-gray-600 mb-1">Nation: {couple.nation}</p>
            <p className="text-sm text-gray-600">Group: {couple.group}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CoupleForm = ({ couple, onSubmit, onCancel, loading, title }) => {
  const [formData, setFormData] = useState({
    names: couple?.names || '',
    surname: couple?.surname || '',
    location: couple?.location || '',
    nation: couple?.nation || '',
    group: couple?.group || 'local',
    bgImageName: couple?.bgImageName || '',
    ...couple
  });
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalData = { ...formData };
    
    // Handle image upload if new image is selected
    if (imageFile) {
      const fileName = `${formData.bgImageName || formData.names.replace(/\s+/g, '')}.${imageFile.name.split('.').pop()}`;
      const uploadResult = await uploadImageToFirebase(imageFile, fileName);
      if (uploadResult.success) {
        finalData.bgImageName = fileName.split('.')[0]; // Remove extension
        finalData.imageUrl = uploadResult.url;
      }
    }
    
    onSubmit(finalData);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Names</label>
          <input
            type="text"
            value={formData.names}
            onChange={(e) => setFormData({ ...formData, names: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nation</label>
          <input
            type="text"
            value={formData.nation}
            onChange={(e) => setFormData({ ...formData, nation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
          <select
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="local">Local</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="md:col-span-2 flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
