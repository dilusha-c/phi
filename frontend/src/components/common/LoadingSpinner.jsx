const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
