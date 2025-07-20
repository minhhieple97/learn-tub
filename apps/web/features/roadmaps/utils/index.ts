export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    case "archived":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Unknown";
  }
};
