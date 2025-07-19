// pages/ContactsPage.jsx
import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import ContactCard from '../components/ContactCard';
import { contacts } from '../data/contacts';

function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');

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
        searchPlaceholder="Search Professors..."
        onSearch={setSearchQuery}
        onSort={setSortBy}
        sortOptions={['Name', 'Designation', 'Department']}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Faculty Contacts
          </h1>
          <p className="text-lg text-gray-600">
            Connect with faculty members across different departments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedContacts.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>

        {!filteredAndSortedContacts.length && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No contacts found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ContactsPage;
