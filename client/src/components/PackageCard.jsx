import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';

const FALLBACK_IMAGE =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e5e7eb"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-size="28">
        No image
      </text>
    </svg>`
	);

const normalizeImageUrl = (img) => {
	if (!img) return FALLBACK_IMAGE;
	if (String(img).startsWith('http')) return img;
	return `http://localhost:5050${img}`;
};

export default function PackageCard({ id, title, price, image, destination, duration }) {
	return (
		<Card className="overflow-hidden">
			<img src={normalizeImageUrl(image)} alt={title} className="w-full h-44 object-cover" />
			<div className="p-6">
				<div className="flex items-start justify-between gap-3">
					<h3 className="text-lg font-heading font-bold tracking-tight text-mountain line-clamp-1">{title}</h3>
					<span className="text-sm font-bold bg-adventure/10 text-adventure px-2 py-1 rounded-xl">
						${price}
					</span>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
					{!!destination && (
						<span className="text-charcoal/70 dark:text-sand/70 line-clamp-1">📍 {destination}</span>
					)}
					{!!duration && (
						<span className="px-2 py-1 rounded-full bg-soft/70 dark:bg-white/10 text-charcoal/70 dark:text-sand/70 text-xs">
							⏳ {duration}
						</span>
					)}
				</div>

				<Button as={Link} to={`/packages/${id}`} className="w-full mt-4">
					View Details
				</Button>
			</div>
		</Card>
	);
}
