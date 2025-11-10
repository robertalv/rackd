export function calculateProfileCompletion(user: any): number {
  if (!user) return 0;
  
  // Define profile fields with their weights (importance)
  // Updated to work with WorkOS user structure
  const profileFields = [
    // Essential fields (higher weight)
    { field: user.email || user.workos?.email, weight: 15, required: true },
    { field: user.displayName, weight: 30, required: true },
    
    // Important fields (medium weight)
    { field: user.imageUrl || user.coverImage || user.workos?.profilePictureUrl, weight: 10, required: false },
    { field: user.country, weight: 10, required: false },
    { field: user.city, weight: 8, required: false },
    
    // Optional but valuable fields (lower weight)
    { field: user.region, weight: 5, required: false },
    { field: user.bio, weight: 10, required: false },
  ];
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  profileFields.forEach(({ field, weight, required }) => {
    totalWeight += weight;
    
    // Check if field is completed
    const isCompleted = field && 
      (typeof field === 'string' ? field.trim() !== '' : true);
    
    if (isCompleted) {
      completedWeight += weight;
    }
  });
  
  // Calculate percentage
  const percentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  
  return Math.round(percentage);
}

export function getProfileCompletionColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

interface MissingField {
  key: string;
  label: string;
  weight: number;
  required: boolean;
}

export function getProfileCompletionDetails(user: any) {
  if (!user) return { percentage: 0, missingFields: [], suggestions: [], totalFields: 0, completedFields: 0 };
  
  // Updated to work with WorkOS user structure
  const profileFields = [
    { key: 'email', field: user.email || user.workos?.email, weight: 15, required: true, label: 'Email Address' },
    { key: 'displayName', field: user.displayName, weight: 30, required: true, label: 'Display Name' },
    { key: 'image', field: user.imageUrl || user.coverImage || user.workos?.profilePictureUrl, weight: 10, required: false, label: 'Profile Picture' },
    { key: 'country', field: user.country, weight: 10, required: false, label: 'Country' },
    { key: 'city', field: user.city, weight: 8, required: false, label: 'City' },
    { key: 'region', field: user.region, weight: 5, required: false, label: 'State/Region' },
    { key: 'bio', field: user.bio, weight: 10, required: false, label: 'Bio' },
  ];
  
  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields: MissingField[] = [];
  
  profileFields.forEach(({ key, field, weight, required, label }) => {
    totalWeight += weight;
    
    const isCompleted = field && 
      (typeof field === 'string' ? field.trim() !== '' : true);
    
    if (isCompleted) {
      completedWeight += weight;
    } else {
      missingFields.push({ key, label, weight, required });
    }
  });
  
  // Sort missing fields by weight (importance) descending
  missingFields.sort((a, b) => b.weight - a.weight);
  
  // Generate suggestions for next steps
  const suggestions = missingFields.slice(0, 3).map(field => field.label);
  
  const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  
  return {
    percentage,
    missingFields,
    suggestions,
    totalFields: profileFields.length,
    completedFields: profileFields.length - missingFields.length
  };
}