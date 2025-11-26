
import React, { useState, useMemo } from 'react';
import { Contacts } from '../data/Contacts';

const ContactPage = () => {
	const [query, setQuery] = useState('');
	const [grade, setGrade] = useState('all');

	const gradeOptions = useMemo(() => {
		const setGrades = new Set();
		Contacts.forEach((c) => {
			if (c.designation) setGrades.add(c.designation);
		});
		return ['All', ...Array.from(setGrades)];
	}, []);

	const filtered = Contacts.filter((c) => {
		const q = query.trim().toLowerCase();

		// Grade filter
		if (grade !== 'all' && c.designation !== grade) return false;

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

					<div className="w-full sm:w-1/4">
						<label className="sr-only">Grade</label>
						<select
							value={grade}
							onChange={(e) => setGrade(e.target.value)}
							className="w-full px-4 py-3 rounded shadow-sm border bg-white focus:outline-none"
						>
							{gradeOptions.map((g) => (
								<option key={g} value={g === 'All' ? 'all' : g}>
									{g}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
					{filtered.map((contact) => (
						<div key={contact.id} className="bg-white shadow-md rounded-lg p-6 flex gap-6 items-center">
							{/* Left: photo with phone below */}
							<div className="flex flex-col items-center flex-shrink-0">
								<img
									src={contact.photo}
									alt={contact.name}
									className="w-36 h-36 object-cover rounded-md"
								/>
								<p className="mt-3 text-sm text-gray-700"><span className="font-bold">Phone:</span> {contact.phone}</p>
							</div>

							{/* Right: details, with email and phone on same line at the end */}
							<div className="flex-1">
								<h2 className="text-2xl font-semibold mb-2">{contact.name}</h2>
								<p className="mb-1"><span className="font-bold">Designation:</span> {contact.designation}</p>
								<p className="mb-1"><span className="font-bold">Room:</span> {contact.cabin}</p>
								<p className="mb-1"><span className="font-bold">Department:</span> {contact.department}</p>
								<p className="mb-1"><span className="font-bold">Grade:</span> {contact.designation}</p>
								<p className="mb-1"><span className="font-bold">Gmail :</span>{contact.email}</p>
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
