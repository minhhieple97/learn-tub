type DashboardHeaderProps = {
  title: string;
  description: string;
};

export const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};