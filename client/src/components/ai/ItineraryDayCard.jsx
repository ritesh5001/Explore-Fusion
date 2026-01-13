export default function ItineraryDayCard({ day, plan }) {
	return (
		<div className="relative pl-10">
			<div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-blue-600" />
			<div className="bg-white border rounded-lg p-4">
				<div className="font-semibold text-gray-900">Day {day}</div>
				<div className="text-gray-700 mt-2 whitespace-pre-wrap break-words">{plan}</div>
			</div>
		</div>
	);
}
