import logo from "../assets/logo.png";

export default function Seal({ size = 64, withGlow = true }) {
  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl" aria-hidden="true" />
      )}
      <img
        src={logo}
        alt="Sello de Tecno Team CTG"
        className="relative w-full h-full object-contain"
      />
    </div>
  );
}
