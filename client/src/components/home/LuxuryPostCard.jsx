import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import SafeImage from '../common/SafeImage';
import LuxImage from '../ui/LuxImage';
import { useReveal } from '../../hooks/useReveal';
import { hoverLuxury } from '../../theme/variants';

const overlayVariants = {
	collapsed: {
		height: '22%',
		translateY: 0,
		transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
	},
	expanded: {
		height: '52%',
		translateY: 0,
		transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
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

const infoVariants = {
	collapsed: { opacity: 0, y: 12, transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] } },
	expanded: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1], delay: 0.08 },
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
			className="w-[85vw] sm:w-[360px] md:w-[400px] lg:w-[440px] aspect-square"
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
						initial="collapsed"
						animate={isHovered ? 'expanded' : 'collapsed'}
					>
						<div className="h-full rounded-2xl bg-white/85 backdrop-blur-sm border border-border px-4 py-3 flex flex-col gap-3 overflow-hidden">
							<MotionDiv
								variants={infoVariants}
								aria-hidden={!isHovered}
								className="flex-1 flex flex-col justify-between text-charcoal"
							>
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
								<div className="space-y-1 pt-1">
									<div className="text-[15px] font-semibold tracking-tight text-charcoal">
										{title}
									</div>
									<div className="text-sm leading-snug text-charcoal/70">
										{caption}
									</div>
								</div>
							</MotionDiv>
						</div>
					</MotionDiv>
				</div>
			</MotionDiv>
		</article>
	);
}
