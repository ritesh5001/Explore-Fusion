import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';

export default function AppLayout({ children }) {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	}, [location.pathname]);

	return (
		<div className="min-h-screen bg-sand text-charcoal font-sans flex flex-col">
			<Navbar />
			<main className="flex-1">
				<div className="min-h-[60vh]">{children}</div>
			</main>

			{/* Mobile floating CTA */}
			<div className="fixed bottom-5 right-5 z-40 sm:hidden">
				<Button as={Link} to="/packages" size="md" className="shadow-[0_18px_55px_rgba(34,211,238,0.18)]">
					Explore Trips
				</Button>
			</div>
			<Footer />
		</div>
	);
}
