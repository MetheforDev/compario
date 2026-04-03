export default function Divider() {
  return (
    <div className="relative my-16">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-[#08090E] px-4">
          <div className="h-1 w-16 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan rounded-full" />
        </div>
      </div>
    </div>
  );
}
