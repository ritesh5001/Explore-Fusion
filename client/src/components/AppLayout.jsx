import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function AppLayout({ children }) {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	}, [location.pathname]);

	return (
		<div className="min-h-screen bg-sand dark:bg-[#081410] text-charcoal dark:text-sand font-sans flex flex-col">
			<Navbar />
			<main className="flex-1 animate-fade-in">{children}</main>
			<Footer />
		</div>
	);
}
