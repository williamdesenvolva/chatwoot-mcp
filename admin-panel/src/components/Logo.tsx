interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Abstract "D" with network nodes */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="22" fill="#0A0F26" />

        {/* Inner glow ring */}
        <circle cx="24" cy="24" r="18" stroke="#0FF2B2" strokeWidth="1" opacity="0.3" />

        {/* Main "D" shape with gradient */}
        <path
          d="M16 12h8c7.732 0 14 6.268 14 14s-6.268 14-14 14h-8V12z"
          fill="url(#brandGradient)"
          opacity="0.9"
        />

        {/* Network nodes */}
        <circle cx="20" cy="18" r="2.5" fill="#47A7F6" />
        <circle cx="28" cy="24" r="3" fill="#0FF2B2" />
        <circle cx="20" cy="30" r="2.5" fill="#47A7F6" />

        {/* Connection lines */}
        <line x1="20" y1="18" x2="28" y2="24" stroke="#47A7F6" strokeWidth="1.5" opacity="0.6" />
        <line x1="28" y1="24" x2="20" y2="30" stroke="#47A7F6" strokeWidth="1.5" opacity="0.6" />
        <line x1="20" y1="18" x2="20" y2="30" stroke="#0FF2B2" strokeWidth="1" opacity="0.4" />

        <defs>
          <linearGradient id="brandGradient" x1="16" y1="12" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0FF2B2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#47A7F6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-display font-semibold ${text} text-slate-800`}>
            Desenvolva
          </span>
          <span className="text-xs font-medium tracking-wider text-brand uppercase">
            MCP
          </span>
        </div>
      )}
    </div>
  );
}
