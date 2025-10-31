import { useData } from '@/contexts/DataContext';
import { PerformanceReview } from '@/types/employee';

export function usePerformanceReviews() {
  const { performanceReviews, addPerformanceReview, updatePerformanceReview, deletePerformanceReview, employees } = useData();

  const getReviewsByEmployee = (employeeId: string): PerformanceReview[] => {
    return performanceReviews.filter(r => r.employeeId === employeeId);
  };

  const getLatestReview = (employeeId: string): PerformanceReview | undefined => {
    const reviews = getReviewsByEmployee(employeeId);
    return reviews.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())[0];
  };

  const getAverageRating = (): number => {
    if (performanceReviews.length === 0) return 0;
    const sum = performanceReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / performanceReviews.length;
  };

  const getGoalCompletionRate = (): number => {
    const allGoals = performanceReviews.flatMap(r => r.goals);
    if (allGoals.length === 0) return 0;
    const totalCompletion = allGoals.reduce((acc, goal) => acc + goal.completionPercentage, 0);
    return totalCompletion / allGoals.length;
  };

  return {
    performanceReviews,
    employees,
    addPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
    getReviewsByEmployee,
    getLatestReview,
    getAverageRating,
    getGoalCompletionRate,
  };
}
