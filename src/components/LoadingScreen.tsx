
const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Pulsing background circles */}
        <div className="absolute w-full h-full rounded-full bg-primary/5 animate-pulse-soft" />
        <div
          className="absolute w-3/4 h-3/4 rounded-full bg-primary/10 animate-pulse-soft"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Main logo container */}
        <div className="relative w-28 h-28 rounded-full bg-background shadow-lg flex items-center justify-center">
          <span className="font-heading text-5xl font-bold text-primary animate-fade-in">
            OV
          </span>
        </div>

        {/* Spinning border */}
        <div
          className="absolute w-full h-full rounded-full border-2 border-dashed border-primary/20 animate-spin"
          style={{ animationDuration: '20s' }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
