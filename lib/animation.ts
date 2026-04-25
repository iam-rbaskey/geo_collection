import { animate } from 'animejs';

export const triggerUserMarkerAnim = (el: HTMLElement | null) => {
  if (!el) return;
  animate(el, {
    scale: [1, 1.2, 1],
    boxShadow: ['0px 0px 10px 0px #00ffd5', '0px 0px 30px 10px #00ffd5', '0px 0px 10px 0px #00ffd5']
  }, {
    duration: 1500,
    loop: true,
    ease: 'inOutSine'
  });
};

export const triggerCollectibleHoverAnim = (el: HTMLElement | null) => {
  if (!el) return;
  animate(el, {
    y: ['-5px', '5px'],
    rotate: [0, 360],
    boxShadow: ['0px 0px 15px 5px #00ffd5', '0px 0px 25px 15px #00ffd5']
  }, {
    duration: 3000,
    loop: true,
    alternate: true,
    ease: 'inOutQuad'
  });
};

export const triggerBurstAnim = (el: HTMLElement | null, onComplete?: () => void) => {
  if (!el) return;
  animate(el, {
    scale: [1, 3],
    opacity: [1, 0]
  }, {
    duration: 600,
    ease: 'outExpo',
    onComplete: onComplete
  });
};

export const triggerPopupScore = (el: HTMLElement | null) => {
  if (!el) return;
  animate(el, {
    scale: [1, 1.5, 1],
    color: ['#e2e8f0', '#00ffd5', '#e2e8f0']
  }, {
    duration: 600,
    ease: 'outElastic(1, .8)'
  });
};
