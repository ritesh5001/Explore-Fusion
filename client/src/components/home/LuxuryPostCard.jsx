import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import SafeImage from '../common/SafeImage';
import LuxImage from '../ui/LuxImage';
import { useReveal } from '../../hooks/useReveal';
import { hoverLuxury } from '../../theme/variants';


const overlayVariants = {
	rest: {
		height: '22%',
		translateY: 0,
		transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
	},
	hover: {
		height: '52%',
		translateY: -4,
		transition: { duration: 0.52, ease: [0.22, 0.61, 0.36, 1] },
	},
};

const mediaVariants = {
	collapsed: {
		filter: 'blur(0px)',
		scale: 1,
		transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
	},
	expanded: {
		filter: 'blur(2px)',
		scale: 1.04,
		transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
	},
};

const detailVariants = {
	rest: { opacity: 0, y: 12, transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] } },
	hover: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 },
	},
};

const MotionDiv = motion.div;

const getAuthor = (post) => post?.user || post?.author;

export default function LuxuryPostCard({ post, revealDelayMs = 0 }) {
	const revealRef = useReveal();
	const [isHovered, setIsHovered] = useState(false);
	const author = getAuthor(post);
	const authorId = author?._id ? String(author._id) : '';
	const username = author?.username ? String(author.username) : '';
	const name = author?.name ? String(author.name) : '';
	const handle = username ? `@${username}` : name || 'Unknown';
	const location = post?.location ? String(post.location) : '—';
	const imageUrl = post?.imageUrl ? String(post.imageUrl) : '';
	const title = post?.title ? String(post.title) : 'Untitled memory';
	const caption = post?.caption || post?.description || 'A quiet moment along the road.';
	const tags = Array.isArray(post?.tags) ? post.tags.filter(Boolean) : [];

	const header = (
		<div className="flex items-center gap-2 min-w-0">
			<div className="h-7 w-7 rounded-full overflow-hidden border border-soft/70 bg-soft/40 shrink-0">
				<SafeImage
					src={author?.avatar || ''}
					alt={handle}
					fallback="/avatar-placeholder.png"
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="min-w-0">
				<div className="text-[12px] tracking-wide text-charcoal/85 truncate">{handle}</div>
				<div className="text-[11px] tracking-wide text-charcoal/55 truncate">{location}</div>
			</div>
		</div>
	);

	return (
		<article
			ref={revealRef}
			data-reveal
			style={{ ['--reveal-delay']: `${Math.max(0, Number(revealDelayMs) || 0)}ms` }}
			className="w-[85vw] sm:w-[400px] md:w-[520px] lg:w-[640px] aspect-square"
		>
			<MotionDiv
				{...hoverLuxury}
				className="rounded-[26px] border border-border bg-card overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.06)] h-full"
				whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}
				transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
			>
				<div className="relative w-full h-full">
					<MotionDiv
						className="absolute inset-0 w-full h-full"
						variants={mediaVariants}
						animate={isHovered ? 'expanded' : 'collapsed'}
					>
						{imageUrl ? (
							<LuxImage
								src={imageUrl}
								alt={post?.title || 'Post image'}
								className="w-full h-full object-cover"
								transform="w-1400,h-1050"
							/>
						) : (
							<div className="w-full h-full bg-soft/50" />
						)}
					</MotionDiv>

					<MotionDiv
						className="absolute inset-x-0 bottom-0 px-4"
						variants={overlayVariants}
						initial="rest"
						animate={isHovered ? 'hover' : 'rest'}
					>
						<div className="h-full rounded-2xl bg-white/85 backdrop-blur-sm border border-border px-4 py-3 flex flex-col gap-3 justify-center overflow-hidden">
							<div className="flex items-center justify-between gap-4">
								{authorId ? (
									<Link
										to={`/users/${authorId}`}
										className="min-w-0 hover:opacity-90 transition-opacity duration-200 ease-standard"
										aria-label={`View profile: ${handle}`}
									>
										{header}
										</Link>
								) : (
										header
									)}
								<div className="text-[11px] tracking-[0.18em] text-muted uppercase whitespace-nowrap">
									Recent
								</div>
								</div>
							<MotionDiv
								variants={detailVariants}
								initial="rest"
								animate={isHovered ? 'hover' : 'rest'}
								className="flex-1 flex flex-col gap-2 text-charcoal"
							>
								<div className="text-[15px] font-semibold tracking-tight">
									{title}
								</div>
								<div className="text-sm leading-snug text-charcoal/70">
									{caption}
								</div>
								{post?.location ? (
									<div className="text-xs uppercase tracking-[0.3em] text-muted">
										{post.location}
									</div>
								) : null}
								{tags.length > 0 ? (
									<div className="flex flex-wrap gap-2 text-[10px] tracking-[0.4em] uppercase text-muted">
										{tags.slice(0, 3).map((tag) => (
											<span key={tag} className="px-3 py-1 rounded-full bg-soft/50">
												{tag}
											</span>
										))}
									</div>
								) : null}
							</MotionDiv>
						</div>
					</MotionDiv>
				</div>
			</MotionDiv>
		</article>
	);
}
