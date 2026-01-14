import { useMemo, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageLoader from '../ui/PageLoader';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import LuxImage from '../ui/LuxImage';

export default function ProfilePostsGrid({ posts, loading, error, onRetry }) {
	const safePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);
	const [openPost, setOpenPost] = useState(null);

	if (loading) return <PageLoader label="Loading posts…" />;

	if (error) {
		return (
			<ErrorState
				title="Couldn’t load posts"
				description={error}
				onRetry={onRetry}
				retryLabel="Retry"
			/>
		);
	}

	if (!safePosts.length) {
		return <EmptyState title="No posts yet" description="This user hasn’t shared any stories yet." />;
	}

	return (
		<>
			<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
				{safePosts.map((post) => {
					const hasImage = Boolean(post?.imageUrl);
					const title = post?.title || 'Post';
					return (
						<button
							key={post._id}
							type="button"
							onClick={() => setOpenPost(post)}
							className="relative w-full aspect-square rounded-xl overflow-hidden border border-soft dark:border-white/10 bg-white/60 dark:bg-white/5 hover:opacity-95 transition-opacity"
							aria-label={`Open post: ${title}`}
						>
							{hasImage ? (
								<LuxImage
									src={post.imageUrl}
									alt={title}
									className="w-full h-full"
									transform="w-600,h-600"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center p-3">
									<div className="text-xs text-charcoal/70 dark:text-sand/70 line-clamp-4">
										{String(post?.content || '').slice(0, 140) || 'No image'}
									</div>
								</div>
							)}
						</button>
					);
				})}
			</div>

			{openPost && (
				<div
					className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					onClick={() => setOpenPost(null)}
				>
					<Card
						className="w-full max-w-2xl p-0 overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-4 border-b border-soft dark:border-white/10">
							<div className="font-heading font-bold text-mountain dark:text-sand truncate">
								{openPost.title || 'Post'}
							</div>
							<Button type="button" variant="outline" size="sm" onClick={() => setOpenPost(null)}>
								Close
							</Button>
						</div>

						{openPost.imageUrl ? (
							<div className="p-4">
								<LuxImage
									src={openPost.imageUrl}
									alt={openPost.title || 'Post image'}
									className="w-full h-[50vh] rounded-2xl"
									transform="w-1200,h-900"
								/>
							</div>
						) : null}

						<div className="px-4 pb-5 text-charcoal/80 dark:text-sand/80 whitespace-pre-wrap">
							{openPost.content}
						</div>
					</Card>
				</div>
			)}
		</>
	);
}
