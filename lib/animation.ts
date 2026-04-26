export const triggerUserMarkerAnim = (el: HTMLElement | null) => {
  if (!el) return;
  el.animate(
    [
      { transform: 'scale(1)', boxShadow: '0px 0px 10px 0px #00ffd5' },
      { transform: 'scale(1.2)', boxShadow: '0px 0px 30px 10px #00ffd5' },
      { transform: 'scale(1)', boxShadow: '0px 0px 10px 0px #00ffd5' }
    ],
    {
      duration: 1500,
      iterations: Infinity,
      easing: 'ease-in-out'
    }
  );
};

export const triggerCollectibleHoverAnim = (el: HTMLElement | null) => {
  // Removed floating animation as per requirement
  if (!el) return;
};

export const triggerBurstAnim = (el: HTMLElement | null, onComplete?: () => void) => {
  if (!el) return;
  const animation = el.animate(
    [
      { transform: 'scale(1)', opacity: '1' },
      { transform: 'scale(3)', opacity: '0' }
    ],
    {
      duration: 600,
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
    }
  );
  if (onComplete) {
    animation.onfinish = onComplete;
  }
};

export const triggerPopupScore = (el: HTMLElement | null) => {
  if (!el) return;
  el.animate(
    [
      { transform: 'scale(1)', color: '#e2e8f0' },
      { transform: 'scale(1.5)', color: '#00ffd5' },
      { transform: 'scale(1)', color: '#e2e8f0' }
    ],
    {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  );
};

/**
 * Animate route line drawing from start to end using anime.js
 * @param pathElement - SVG path or line element to animate
 * @param duration - Animation duration in ms
 */
export const animateRouteLine = (pathElement: SVGPathElement | null, duration = 2000) => {
  if (!pathElement) return;
  
  const length = pathElement.getTotalLength();
  pathElement.style.strokeDasharray = `${length}`;
  pathElement.style.strokeDashoffset = `${length}`;
  
  pathElement.animate(
    [
      { strokeDashoffset: length },
      { strokeDashoffset: 0 }
    ],
    {
      duration,
      easing: 'ease-in-out',
      fill: 'forwards'
    }
  );
};
