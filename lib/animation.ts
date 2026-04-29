import anime from 'animejs';

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

export const triggerAcquisitionAnimation = (imgSrc: string) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '9999';
  container.style.pointerEvents = 'none';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  
  const glow = document.createElement('div');
  glow.style.position = 'absolute';
  glow.style.width = '100px';
  glow.style.height = '100px';
  glow.style.borderRadius = '50%';
  glow.style.background = 'radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(56,189,248,0) 70%)';
  glow.style.transform = 'scale(0)';
  
  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.width = '150px';
  img.style.height = '150px';
  img.style.objectFit = 'contain';
  img.style.transform = 'scale(0)';
  img.style.position = 'relative';
  img.style.zIndex = '2';

  container.appendChild(glow);
  container.appendChild(img);
  document.body.appendChild(container);

  // Step 1: screen focus zoom
  anime({
    targets: container,
    backgroundColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'],
    backdropFilter: ['blur(0px)', 'blur(8px)'],
    duration: 400,
    easing: 'easeOutQuad'
  });

  // Step 2: Energy Burst
  anime({
    targets: glow,
    scale: [0, 12],
    opacity: [1, 0],
    duration: 700,
    easing: 'easeOutExpo',
    delay: 400
  });

  // Step 3: Character Reveal
  anime({
    targets: img,
    scale: [0, 1.2, 1],
    rotateZ: ['-15deg', '10deg', '0deg'],
    opacity: [0, 1],
    duration: 900,
    easing: 'easeOutElastic(1, .6)',
    delay: 500
  });

  // Step 4: Inventory Add flash & cleanup
  anime({
    targets: [img, container],
    opacity: 0,
    scale: 0.5,
    duration: 500,
    delay: 2000,
    easing: 'easeInQuad',
    complete: () => {
      if (container.parentNode) container.parentNode.removeChild(container);
    }
  });
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
