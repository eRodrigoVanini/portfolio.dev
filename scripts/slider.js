document.addEventListener("DOMContentLoaded", () => {
  const sliderTrack = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slider-track .card-projects");
  const prevBtn = document.querySelector(".slider-btn-prev");
  const nextBtn = document.querySelector(".slider-btn-next");
  const indicatorsContainer = document.querySelector(".slider-indicators");

  if (!sliderTrack || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let isAnimating = false;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  // Criar indicadores dinamicamente
  slides.forEach((_, index) => {
    const indicator = document.createElement("button");
    indicator.classList.add("slider-indicator");
    indicator.setAttribute("aria-label", `Ir para projeto ${index + 1}`);
    if (index === 0) indicator.classList.add("active");
    indicator.addEventListener("click", () => goToSlide(index));
    indicatorsContainer.appendChild(indicator);
  });

  const indicators = document.querySelectorAll(".slider-indicator");

  // Calcular largura do card + gap
  function getSlideWidth() {
    const slide = slides[0];
    const style = window.getComputedStyle(sliderTrack);
    const gap = parseFloat(style.gap) || 24;
    return slide.offsetWidth + gap;
  }

  // Atualizar indicadores ativos
  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  // Atualizar estado dos botões
  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalSlides - 1;
  }

  // Animação suave customizada com easing
  function smoothScrollTo(targetScroll, duration = 400) {
    if (isAnimating) return;
    isAnimating = true;

    const startScroll = sliderTrack.scrollLeft;
    const distance = targetScroll - startScroll;
    const startTime = performance.now();

    // Easing function - easeOutCubic para movimento natural
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      sliderTrack.scrollLeft = startScroll + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimating = false;
        updateCurrentIndexFromScroll();
      }
    }

    requestAnimationFrame(animate);
  }

  // Navegar para um slide específico
  function goToSlide(index) {
    if (isAnimating) return;

    // Limitar índice
    index = Math.max(0, Math.min(index, totalSlides - 1));

    currentIndex = index;
    const slideWidth = getSlideWidth();
    const targetScroll = index * slideWidth;

    smoothScrollTo(targetScroll);
    updateIndicators();
    updateButtons();
  }

  // Calcular índice atual baseado no scroll
  function updateCurrentIndexFromScroll() {
    const slideWidth = getSlideWidth();
    const newIndex = Math.round(sliderTrack.scrollLeft / slideWidth);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
      currentIndex = newIndex;
      updateIndicators();
      updateButtons();
    }
  }

  // Eventos dos botões
  prevBtn.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
  });

  // Drag to scroll - Mouse
  sliderTrack.addEventListener("mousedown", (e) => {
    isDragging = true;
    sliderTrack.style.cursor = "grabbing";
    startX = e.pageX - sliderTrack.offsetLeft;
    scrollLeft = sliderTrack.scrollLeft;
  });

  sliderTrack.addEventListener("mouseleave", () => {
    if (isDragging) {
      isDragging = false;
      sliderTrack.style.cursor = "grab";
      snapToNearestSlide();
    }
  });

  sliderTrack.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      sliderTrack.style.cursor = "grab";
      snapToNearestSlide();
    }
  });

  sliderTrack.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderTrack.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador de velocidade
    sliderTrack.scrollLeft = scrollLeft - walk;
  });

  // Snap para o slide mais próximo após drag
  function snapToNearestSlide() {
    const slideWidth = getSlideWidth();
    const nearestIndex = Math.round(sliderTrack.scrollLeft / slideWidth);
    goToSlide(nearestIndex);
  }

  // Touch events para mobile
  let touchStartX = 0;
  let touchScrollLeft = 0;

  sliderTrack.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchScrollLeft = sliderTrack.scrollLeft;
    },
    { passive: true },
  );

  sliderTrack.addEventListener(
    "touchmove",
    (e) => {
      const touchX = e.touches[0].clientX;
      const diff = touchStartX - touchX;
      sliderTrack.scrollLeft = touchScrollLeft + diff;
    },
    { passive: true },
  );

  sliderTrack.addEventListener(
    "touchend",
    () => {
      snapToNearestSlide();
    },
    { passive: true },
  );

  // Scroll com wheel (horizontal)
  sliderTrack.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Scroll horizontal nativo
        return;
      }

      // Converter scroll vertical em horizontal
      if (Math.abs(e.deltaY) > 10) {
        e.preventDefault();
        if (e.deltaY > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    },
    { passive: false },
  );

  // Navegação por teclado
  document.addEventListener("keydown", (e) => {
    const projectsSection = document.querySelector("#myProjects");
    const rect = projectsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible && !isAnimating) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      }
    }
  });

  // Atualizar ao redimensionar a janela
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      goToSlide(currentIndex);
    }, 150);
  });

  // Inicializar estado dos botões
  updateButtons();
});
