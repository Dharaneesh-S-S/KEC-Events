import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  Activity
} from 'lucide-react';

function Departments({ departments = [], setDepartments = () => {} }) {
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [newDepartment, setNewDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      alert('Please enter a department name');
      return;
    }
    
    if (departments.includes(newDepartment.toUpperCase())) {
      alert('Department already exists');
      return;
    }
    
    setDepartments([...departments, newDepartment.toUpperCase()]);
    setNewDepartment('');
    setShowAddForm(false);
  };

  const handleEditDepartment = (oldName, newName) => {
    if (!newName.trim()) {
      alert('Please enter a department name');
      return;
    }
    
    if (departments.includes(newName.toUpperCase()) && newName.toUpperCase() !== oldName) {
      alert('Department already exists');
      return;
    }
    
    setDepartments(departments.map(dept => 
      dept === oldName ? newName.toUpperCase() : dept
    ));
    setEditingDept(null);
  };

  const handleDeleteDepartment = (deptName) => {
    if (window.confirm(`Are you sure you want to delete ${deptName}?`)) {
      setDepartments(departments.filter(dept => dept !== deptName));
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Departments</h4>
          <p className="text-sm text-gray-600">Manage department categories for clubs</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Add New Department</h5>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Enter department name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddDepartment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewDepartment('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => (
          <div key={dept} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{dept}</h5>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>0 clubs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>0 events</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setEditingDept(dept)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit department"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {editingDept === dept && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    defaultValue={dept}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditDepartment(dept, e.target.value);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(`input[defaultValue="${dept}"]`);
                      if (input) {
                        handleEditDepartment(dept, input.value);
                      }
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingDept(null)}
                    className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No departments found' : 'No departments yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.' 
              : 'Get started by adding your first department.'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {departments.length} total departments
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredDepartments.length} showing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Departments;
