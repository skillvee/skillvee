export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animation classes
  const animatedElements = document.querySelectorAll('[class*="animate-on-scroll"]');
  animatedElements.forEach((el) => observer.observe(el));

  // Handle stagger animation children
  const staggerContainers = document.querySelectorAll('.stagger-animation');
  staggerContainers.forEach((container) => {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  });
}