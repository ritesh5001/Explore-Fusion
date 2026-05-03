import { UserDocument } from '../models/User.js';

function overlapCount(a: string[], b: string[]) {
  const bSet = new Set(b.map((item) => item.toLowerCase()));
  return a.filter((item) => bSet.has(item.toLowerCase())).length;
}

function dateOverlapDays(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const start = Math.max(aStart.getTime(), bStart.getTime());
  const end = Math.min(aEnd.getTime(), bEnd.getTime());
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function calculateCompatibilityScore(currentUser: UserDocument, candidate: UserDocument) {
  const destinationMatches = overlapCount(currentUser.dreamDestinations, candidate.dreamDestinations);
  const destinationScore = Math.min(destinationMatches / 3, 1) * 30;

  const maxDateOverlap = currentUser.tripPlans.reduce((max, trip) => {
    const candidateMax = candidate.tripPlans.reduce((candidateTripMax, candidateTrip) => {
      return Math.max(
        candidateTripMax,
        dateOverlapDays(trip.startDate, trip.endDate, candidateTrip.startDate, candidateTrip.endDate)
      );
    }, 0);
    return Math.max(max, candidateMax);
  }, 0);
  const dateScore = maxDateOverlap >= 3 ? 25 : Math.min(maxDateOverlap / 3, 1) * 25;

  const styleScore = currentUser.travelStyle === candidate.travelStyle ? 20 : 8;
  const sharedInterests = overlapCount(currentUser.interests, candidate.interests);
  const interestBase = Math.max(currentUser.interests.length, candidate.interests.length, 1);
  const interestScore = (sharedInterests / interestBase) * 15;

  const currentAverageBudget = (currentUser.budgetMin + currentUser.budgetMax) / 2;
  const candidateAverageBudget = (candidate.budgetMin + candidate.budgetMax) / 2;
  const budgetDelta = Math.abs(currentAverageBudget - candidateAverageBudget) / currentAverageBudget;
  const budgetScore = budgetDelta <= 0.3 ? 10 : Math.max(0, 10 - budgetDelta * 10);

  return Math.round(destinationScore + dateScore + styleScore + interestScore + budgetScore);
}
