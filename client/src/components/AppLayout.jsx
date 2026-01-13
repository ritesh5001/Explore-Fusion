import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout({ children }) {
	return (
		<div className="min-h-screen bg-sand dark:bg-[#081410] text-charcoal dark:text-sand font-sans flex flex-col">
			<Navbar />
			<main className="flex-1 animate-fade-in">{children}</main>
			<Footer />
		</div>
	);
}
