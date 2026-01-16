import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import LuxImage from '../ui/LuxImage';

const getAuthor = (post) => post?.user || post?.author;

export default function LuxuryPostCard({ post }) {
	const author = getAuthor(post);
	const authorId = author?._id ? String(author._id) : '';
	const username = author?.username ? String(author.username) : '';
	const name = author?.name ? String(author.name) : '';
	const handle = username ? `@${username}` : name || 'Unknown';
	const location = post?.location ? String(post.location) : '—';
	const imageUrl = post?.imageUrl ? String(post.imageUrl) : '';

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
				<div className="text-[12px] tracking-wide text-charcoal/85 truncate">
					{handle}
				</div>
				<div className="text-[11px] tracking-wide text-charcoal/55 truncate">{location}</div>
			</div>
		</div>
	);

	return (
		<article className="w-[78vw] sm:w-[520px] lg:w-[560px]">
			<div className="rounded-[26px] border border-border bg-card overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
				<div className="relative">
					{imageUrl ? (
						<LuxImage
							src={imageUrl}
							alt={post?.title || 'Post image'}
							className="w-full h-[340px] sm:h-[380px] lg:h-[420px]"
							transform="w-1400,h-1050"
						/>
					) : (
						<div className="w-full h-[340px] sm:h-[380px] lg:h-[420px] bg-soft/50" />
					)}

					<div className="absolute inset-x-0 bottom-0 p-4">
						<div className="rounded-2xl bg-white/85 backdrop-blur-sm border border-border px-4 py-3">
							<div className="flex items-center justify-between gap-4">
								{authorId ? (
									<Link
										to={`/users/${authorId}`}
										className="min-w-0 hover:opacity-90 transition-opacity"
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
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
