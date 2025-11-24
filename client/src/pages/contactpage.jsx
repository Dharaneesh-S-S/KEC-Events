
import React, { useState } from 'react';
import { Contacts } from '../data/Contacts';

const ContactPage = () => {
	const [query, setQuery] = useState('');

	const filtered = Contacts.filter((c) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return (
			c.name.toLowerCase().includes(q) ||
			c.department.toLowerCase().includes(q) ||
			(c.designation && c.designation.toLowerCase().includes(q))
		);
	});

	return (
		<div className="p-8 bg-gray-100 min-h-screen">
			<h1 className="text-4xl text-center font-semibold mb-8">Contact Details</h1>

			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search staff..."
						className="w-full sm:w-1/2 px-4 py-3 rounded shadow-sm border bg-white focus:outline-none"
					/>
				</div>

				<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
					{filtered.map((contact) => (
						<div key={contact.id} className="bg-white shadow-md rounded-lg p-6 flex gap-6 items-center">
							<img
								src={contact.photo}
								alt={contact.name}
								className="w-36 h-36 object-cover rounded-md flex-shrink-0"
							/>

							<div className="flex-1">
								<h2 className="text-2xl font-semibold mb-2">{contact.name}</h2>
								<p className="mb-1"><span className="font-bold">Designation:</span> {contact.designation}</p>
								<p className="mb-1"><span className="font-bold">Phone:</span> {contact.phone}</p>
								<p className="mb-1"><span className="font-bold">Room:</span> {contact.cabin}</p>
								<p className="mb-1"><span className="font-bold">Department:</span> {contact.department}</p>
								<p className="mb-1"><span className="font-bold">Email:</span> <a className="text-blue-600" href={`mailto:${contact.email}`}>{contact.email}</a></p>
							</div>
						</div>
					))}

					{filtered.length === 0 && (
						<p className="col-span-full text-center text-gray-600">No staff found.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
