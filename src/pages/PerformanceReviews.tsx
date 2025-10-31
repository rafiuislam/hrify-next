import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Trash2, Eye, Edit } from "lucide-react";
import { usePerformanceReviews } from "@/hooks/usePerformanceReviews";
import { useToast } from "@/hooks/use-toast";
import { PerformanceReview, Goal } from "@/types/employee";

export default function PerformanceReviews() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    performanceReviews,
    employees,
    addPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
    getAverageRating,
    getGoalCompletionRate,
  } = usePerformanceReviews();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    reviewPeriodStart: "",
    reviewPeriodEnd: "",
    rating: 5,
    feedback: "",
    reviewedBy: "HR Manager",
  });
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", description: "", completionPercentage: 0, status: "not-started" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.reviewPeriodStart || !formData.reviewPeriodEnd) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const review: PerformanceReview = {
      id: editingReview?.id || Date.now().toString(),
      employeeId: formData.employeeId,
      reviewPeriodStart: formData.reviewPeriodStart,
      reviewPeriodEnd: formData.reviewPeriodEnd,
      rating: formData.rating,
      goals: goals.filter(g => g.description.trim() !== ""),
      feedback: formData.feedback,
      reviewedBy: formData.reviewedBy,
      reviewDate: new Date().toISOString().split('T')[0],
      createdAt: editingReview?.createdAt || new Date().toISOString(),
    };

    if (editingReview) {
      updatePerformanceReview(editingReview.id, review);
      toast({ title: "Success", description: "Performance review updated successfully" });
    } else {
      addPerformanceReview(review);
      toast({ title: "Success", description: "Performance review created successfully" });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      reviewPeriodStart: "",
      reviewPeriodEnd: "",
      rating: 5,
      feedback: "",
      reviewedBy: "HR Manager",
    });
    setGoals([{ id: "1", description: "", completionPercentage: 0, status: "not-started" }]);
    setEditingReview(null);
  };

  const handleEdit = (review: PerformanceReview) => {
    setEditingReview(review);
    setFormData({
      employeeId: review.employeeId,
      reviewPeriodStart: review.reviewPeriodStart,
      reviewPeriodEnd: review.reviewPeriodEnd,
      rating: review.rating,
      feedback: review.feedback,
      reviewedBy: review.reviewedBy,
    });
    setGoals(review.goals.length > 0 ? review.goals : [{ id: "1", description: "", completionPercentage: 0, status: "not-started" }]);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deletePerformanceReview(id);
      toast({ title: "Success", description: "Performance review deleted successfully" });
    }
  };

  const addGoal = () => {
    setGoals([...goals, { 
      id: Date.now().toString(), 
      description: "", 
      completionPercentage: 0, 
      status: "not-started" 
    }]);
  };

  const updateGoal = (index: number, field: keyof Goal, value: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || "Unknown";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Performance Reviews</h1>
                <p className="text-muted-foreground">
                  Employee performance evaluations, goal tracking, and feedback management
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingReview ? "Edit" : "Create"} Performance Review</DialogTitle>
                    <DialogDescription>
                      Add performance evaluation and goals for an employee
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">Employee *</Label>
                      <Select
                        value={formData.employeeId}
                        onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Review Period Start *</Label>
                        <Input
                          id="start"
                          type="date"
                          value={formData.reviewPeriodStart}
                          onChange={(e) => setFormData({ ...formData, reviewPeriodStart: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">Review Period End *</Label>
                        <Input
                          id="end"
                          type="date"
                          value={formData.reviewPeriodEnd}
                          onChange={(e) => setFormData({ ...formData, reviewPeriodEnd: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Overall Rating (1-5)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="rating"
                          type="number"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                          className="w-20"
                        />
                        <div className="flex">{renderStars(formData.rating)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Goals</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Goal
                        </Button>
                      </div>
                      {goals.map((goal, index) => (
                        <Card key={goal.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex justify-between gap-2">
                              <Input
                                placeholder="Goal description"
                                value={goal.description}
                                onChange={(e) => updateGoal(index, "description", e.target.value)}
                                className="flex-1"
                              />
                              {goals.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeGoal(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Completion %</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={goal.completionPercentage}
                                  onChange={(e) => updateGoal(index, "completionPercentage", parseInt(e.target.value))}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select
                                  value={goal.status}
                                  onValueChange={(value) => updateGoal(index, "status", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-started">Not Started</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Detailed performance feedback..."
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reviewer">Reviewed By</Label>
                      <Input
                        id="reviewer"
                        value={formData.reviewedBy}
                        onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingReview ? "Update" : "Create"} Review
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{performanceReviews.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">{getAverageRating().toFixed(1)}</div>
                    <div className="flex">{renderStars(Math.round(getAverageRating()))}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getGoalCompletionRate().toFixed(0)}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Reviews</CardTitle>
                <CardDescription>View and manage employee performance reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No performance reviews found. Click "Add Review" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      performanceReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{getEmployeeName(review.employeeId)}</TableCell>
                          <TableCell>
                            {new Date(review.reviewPeriodStart).toLocaleDateString()} -{" "}
                            {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {review.goals.length} {review.goals.length === 1 ? "goal" : "goals"}
                            </Badge>
                          </TableCell>
                          <TableCell>{review.reviewedBy}</TableCell>
                          <TableCell>{new Date(review.reviewDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(review)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(review.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
