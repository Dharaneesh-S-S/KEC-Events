
import React, { useState, useEffect } from 'react';
import { Contacts } from '../data/Contacts';

const ContactPage = () => {
	const [query, setQuery] = useState('');
	const [menu, setMenu] = useState({ id: null, type: null }); // {id, type: 'phone'|'email'}
	const [copied, setCopied] = useState(null);

	const sanitizePhone = (p) => (p || '').toString().replace(/[^0-9+]/g, '');
	const isMobileCandidate = (p) => {
		const s = sanitizePhone(p).replace(/^\+/, '');
		return s.length === 10; // simple heuristic: 10-digit numbers treated as mobile
	};

	const toggleMenu = (id, type, e) => {
		if (e) e.stopPropagation();
		setMenu((m) => (m && m.id === id && m.type === type ? { id: null, type: null } : { id, type }));
	};

	const closeMenu = () => setMenu({ id: null, type: null });

	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(text);
			setTimeout(() => setCopied(null), 1500);
			closeMenu();
		} catch (err) {
			console.warn('Copy failed', err);
		}
	};

	// Close menus when clicking anywhere outside
	useEffect(() => {
		const handler = () => closeMenu();
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, []);

	const filtered = Contacts.filter((c) => {
		const raw = query.trim();
		if (!raw) return true;

		// Support comma-separated tokens (AND semantics): every token must match at least one field
		const tokens = raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

		return tokens.every((token) => {
			return (
				(c.name && c.name.toLowerCase().includes(token)) ||
				(c.department && c.department.toLowerCase().includes(token)) ||
				(c.designation && c.designation.toLowerCase().includes(token)) ||
				(c.cabin && c.cabin.toLowerCase().includes(token)) ||
				(c.email && c.email.toLowerCase().includes(token)) ||
				(c.phone && c.phone.toLowerCase().includes(token))
			);
		});
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
						placeholder="Search staff (comma-separated, e.g. 'CSE, Professor')"
						className="w-full px-4 py-3 rounded shadow-sm border bg-white focus:outline-none"
					/>
				</div>

				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
					{filtered.map((contact) => (
						<div key={contact.id} className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center hover:bg-blue-50 hover:shadow-lg transition-colors duration-200">
							{/* Left: photo with phone below */}
							<div className="flex flex-col items-center flex-shrink-0">
								<img
									src={contact.photo}
									alt={contact.name}
									className="w-24 h-24 object-cover rounded-full"
								/>
								<div className="mt-2 text-sm text-gray-700 relative">
									<button onClick={(e) => toggleMenu(contact.id, 'phone', e)} className="hover:underline">
										<span className="font-bold">Phone:</span>&nbsp;{contact.phone}
									</button>

										{menu.id === contact.id && menu.type === 'phone' && (
										<div onClick={(e) => e.stopPropagation()} className="absolute left-0 mt-2 w-44 bg-white border rounded shadow-md p-2 z-20">
											{isMobileCandidate(contact.phone) ? (
												<a href={`tel:${sanitizePhone(contact.phone)}`} className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">Call</a>
											) : null}
											<button onClick={() => copyToClipboard(contact.phone)} className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">Copy Number</button>
										</div>
									)}
								</div>
							</div>

							{/* Right: details, with email and phone on same line at the end */}
							<div className="flex-1">
								<h2 className="text-xl font-semibold mb-1">{contact.name}</h2>
								<p className="mb-1 text-sm"><span className="font-bold">Designation:</span> {contact.designation}</p>
								<p className="mb-1 text-sm"><span className="font-bold">Room:</span> {contact.cabin}</p>
								<p className="mb-1 text-sm"><span className="font-bold">Department:</span> {contact.department}</p>

								<div className="flex items-center gap-4 mt-2">
									<div className="relative">
										<button
											onClick={(e) => toggleMenu(contact.id, 'email', e)}
											className="text-sm text-gray-700 hover:underline"
										>
											<span className="font-bold">Email:</span>&nbsp;{contact.email}
										</button>

										{menu.id === contact.id && menu.type === 'email' && (
											<div onClick={(e) => e.stopPropagation()} className="absolute z-20 right-0 mt-2 w-44 bg-white border rounded shadow-md p-2">
												<a href={`mailto:${contact.email}`} className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">Send Mail</a>
												<button onClick={() => copyToClipboard(contact.email)} className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">Copy Email</button>
											</div>
										)}
									</div>
								</div>

								{copied === contact.email || copied === contact.phone ? (
									<p className="mt-2 text-xs text-green-600">Copied!</p>
								) : null}
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
