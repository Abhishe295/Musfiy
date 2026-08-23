// A quiet, premium ambient backdrop — two large, very low-opacity blurred
// gradient blobs that drift slowly. This is deliberately pure CSS rather
// than a WebGL/three.js canvas: at this scale (a soft, slow-moving glow
// behind static content) a GPU-accelerated `transform` animation on a
// couple of divs looks identical to a shader and costs effectively
// nothing, whereas a three.js scene here would mean bundling a 3D engine
// and running a render loop 60x/sec for zero visible difference. Three.js
// is worth reaching for when there's real geometry or audio-reactive
// motion involved — see AudioVisualizer for that.
const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.10] blur-[120px] animate-ambient-drift"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--c-accent)) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full opacity-[0.08] blur-[120px] animate-ambient-drift"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--c-accent-2)) 0%, transparent 70%)",
          animationDelay: "-9s",
        }}
      />
    </div>
  );
};

export default AmbientBackground;
