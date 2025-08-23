// pages/ClubContactsPage.jsx
import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import ContactCard from '../components/ContactCard';
import { contacts } from '../data/contacts';
import { useNavigate } from 'react-router-dom';

function ClubContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const navigate = useNavigate();

  const filteredAndSortedContacts = useMemo(() => {
    let data = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.designation.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortBy) {
      data.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'designation':
            return a.designation.localeCompare(b.designation);
          case 'department':
            return a.department.localeCompare(b.department);
          default:
            return 0;
        }
      });
    }
    return data;
  }, [searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        searchPlaceholder="Search Faculty Contacts..."
        onSearch={setSearchQuery}
        onSort={setSortBy}
        sortOptions={['Name', 'Designation', 'Department']}
        showSearch={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Faculty Contacts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with club members and advisors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredAndSortedContacts.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>

        {!filteredAndSortedContacts.length && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No club contacts found</h3>
              <p className="text-gray-500">
                No club contacts match your current search criteria. Try adjusting your search or filters.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ClubContactsPage;
