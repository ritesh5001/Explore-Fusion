const Loader = ({ label = 'Loading…' }) => {
  return (
    <div className="w-full py-10 flex flex-col items-center justify-center gap-3 text-gray-600">
      <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
      <div className="text-sm">{label}</div>
    </div>
  );
};

export default Loader;
