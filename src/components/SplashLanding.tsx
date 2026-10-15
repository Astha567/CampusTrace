import React, { useEffect, useState } from 'react';

interface SplashLandingProps {
  onComplete: () => void;
}

export const SplashLanding: React.FC<SplashLandingProps> = ({ onComplete }) => {
  const [isPanned, setIsPanned] = useState(false);
  const [isLogoRevealed, setIsLogoRevealed] = useState(false);
  const [isRedirectRevealed, setIsRedirectRevealed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Configuration from the user's animation specification
  const totalSteps = 6;
  const stepDelayMs = 450;
  const finishWalkingTime = totalSteps * stepDelayMs; // ~2700ms

  useEffect(() => {
    // 1. Camera Pan Phase: smoothly slides 100vh down (revealing top half)
    const panTimer = setTimeout(() => {
      setIsPanned(true);
    }, finishWalkingTime + 300); // at ~3.0s

    // 2. Logo Reveal Phase: smoothly fades and scales in
    const logoTimer = setTimeout(() => {
      setIsLogoRevealed(true);
    }, finishWalkingTime + 1600); // at ~4.3s

    // 3. "Redirecting to main page..." text reveal
    const redirectTextTimer = setTimeout(() => {
      setIsRedirectRevealed(true);
    }, finishWalkingTime + 2600); // at ~5.3s

    // 4. Smooth fade out and completion at 6.0s
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5600);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(panTimer);
      clearTimeout(logoTimer);
      clearTimeout(redirectTextTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [finishWalkingTime, onComplete]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <div
      className={`splash-landing-root fixed inset-0 z-[100] w-screen h-screen overflow-hidden select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'var(--theme-bg-base, #FFF5D6)',
        fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Scoped Animation & Keyframe Styles */}
      <style>{`
        .splash-landing-root {
          --cream-white: #FFF5D6;
          --light-rose-pink: #F2B4C0;
          --soft-pastel-pink: #ECC0C2;
        }

        .dark .splash-landing-root {
          --cream-white: #181216;
          --light-rose-pink: #F2B4C0;
          --soft-pastel-pink: #ECC0C2;
        }

        .splash-landing-root #world {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100vw;
          height: 200vh;
          transition: transform 3.5s cubic-bezier(0.35, 0, 0.25, 1);
          will-change: transform;
        }

        .splash-landing-root .footstep {
          position: absolute;
          width: 35px;
          height: 75px;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
          animation: splashStepFade 3s forwards;
          filter: drop-shadow(0 4px 6px rgba(236, 192, 194, 0.45));
        }

        .splash-landing-root .footstep svg {
          width: 100%;
          height: 100%;
          fill: var(--soft-pastel-pink);
        }

        .splash-landing-root .footstep.right svg {
          fill: var(--light-rose-pink);
          transform: scaleX(-1);
        }

        @keyframes splashStepFade {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          60% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .splash-landing-root #logo-container {
          position: absolute;
          top: 50vh;
          left: 50vw;
          transform: translate(-50%, -50%);
          text-align: center;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .splash-landing-root #logo {
          font-size: clamp(3rem, 8vw, 5rem);
          font-weight: 700;
          color: var(--light-rose-pink);
          margin: 0;
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity 2s ease-out, transform 2s cubic-bezier(0.2, 0.8, 0.2, 1);
          letter-spacing: 0.05em;
          text-shadow: 0 4px 20px rgba(242, 180, 192, 0.35);
        }

        .splash-landing-root #logo.reveal {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .splash-landing-root #redirect-text {
          font-size: clamp(0.9rem, 3vw, 1.2rem);
          font-weight: 600;
          color: var(--soft-pastel-pink);
          margin-top: 1.5rem;
          opacity: 0;
          transition: opacity 1.5s ease-in;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .splash-landing-root #redirect-text.reveal {
          opacity: 1;
        }
      `}</style>

      {/* Top right Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 border border-[#F2B4C0]/40 text-[#8C203B] dark:text-[#F2B4C0] bg-white/40 dark:bg-black/30 hover:bg-[#F2B4C0]/30 backdrop-blur-md shadow-sm"
        aria-label="Skip landing sequence"
      >
        Skip →
      </button>

      {/* The 200vh tall world container that pans */}
      <div
        id="world"
        style={{
          transform: isPanned ? 'translateY(100vh)' : 'translateY(0)',
        }}
      >
        {/* Logo Container in the top half (50vh) */}
        <div id="logo-container">
          <h1 id="logo" className={isLogoRevealed ? 'reveal' : ''}>
            Campus Trace
          </h1>
          <p id="redirect-text" className={isRedirectRevealed ? 'reveal' : ''}>
            Redirecting to main page...
          </p>
        </div>

        {/* Footsteps sequentially appearing in the bottom half */}
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isRightFoot = i % 2 !== 0;
          const posY = 185 - i * 15; // Decreasing vh from 185vh to 110vh
          const posX = isRightFoot ? 'calc(50% + 30px)' : 'calc(50% - 30px)';
          const delay = `${i * (stepDelayMs / 1000)}s`;

          return (
            <div
              key={i}
              className={`footstep ${isRightFoot ? 'right' : 'left'}`}
              style={{
                left: posX,
                top: `${posY}vh`,
                animationDelay: delay,
              }}
            >
              <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
                {/* Heel */}
                <path d="M40,190 C25,190 15,175 15,155 C15,135 30,120 45,125 C60,130 65,145 65,160 C65,180 55,190 40,190 Z" />
                {/* Front Sole */}
                <path d="M45,10 C20,10 5,30 5,60 C5,90 20,110 35,110 C50,110 75,95 85,65 C95,35 70,10 45,10 Z" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
