document.addEventListener("DOMContentLoaded", () => {
  const sliderTrack = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slider-track .card-projects");
  const prevBtn = document.querySelector(".slider-btn-prev");
  const nextBtn = document.querySelector(".slider-btn-next");
  const indicatorsContainer = document.querySelector(".slider-indicators");
  const sliderWrapper = document.querySelector(".slider-wrapper");

  if (!sliderTrack || slides.length === 0) return;

  let currentIndex = 0;
  let isAnimating = false;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  // Calcular largura do card + gap
  function getSlideWidth() {
    const slide = slides[0];
    const style = window.getComputedStyle(sliderTrack);
    const gap = parseFloat(style.gap) || 24;
    return slide.offsetWidth + gap;
  }

  // Calcular o scroll máximo possível
  function getMaxScroll() {
    return sliderTrack.scrollWidth - sliderWrapper.offsetWidth;
  }

  // Calcular quantos "passos" são necessários para ver todos os cards
  function getTotalSteps() {
    const slideWidth = getSlideWidth();
    const maxScroll = getMaxScroll();
    return Math.ceil(maxScroll / slideWidth) + 1;
  }

  // Criar/atualizar indicadores dinamicamente
  function createIndicators() {
    indicatorsContainer.innerHTML = "";
    const totalSteps = getTotalSteps();

    for (let i = 0; i < totalSteps; i++) {
      const indicator = document.createElement("button");
      indicator.classList.add("slider-indicator");
      indicator.setAttribute("aria-label", `Ir para posição ${i + 1}`);
      if (i === 0) indicator.classList.add("active");
      indicator.addEventListener("click", () => goToSlide(i));
      indicatorsContainer.appendChild(indicator);
    }
  }

  createIndicators();

  // Atualizar indicadores ativos
  function updateIndicators() {
    const indicators = document.querySelectorAll(".slider-indicator");
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  // Animação suave customizada com easing
  function smoothScrollTo(targetScroll, duration = 400) {
    if (isAnimating) return;
    isAnimating = true;

    const startScroll = sliderTrack.scrollLeft;
    const distance = targetScroll - startScroll;
    const startTime = performance.now();

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
      }
    }

    requestAnimationFrame(animate);
  }

  // Navegar para um slide específico
  function goToSlide(index) {
    if (isAnimating) return;

    const totalSteps = getTotalSteps();
    currentIndex = index;

    const slideWidth = getSlideWidth();
    const maxScroll = getMaxScroll();

    // Calcular o scroll alvo
    let targetScroll = index * slideWidth;

    // Garantir que não passe do máximo
    if (targetScroll > maxScroll) {
      targetScroll = maxScroll;
    }

    smoothScrollTo(targetScroll);
    updateIndicators();
  }

  // Próximo slide COM LOOP
  function nextSlide() {
    if (isAnimating) return;

    const totalSteps = getTotalSteps();

    if (currentIndex >= totalSteps - 1) {
      // Chegou no final -> volta pro início
      goToSlide(0);
    } else {
      goToSlide(currentIndex + 1);
    }
  }

  // Slide anterior COM LOOP
  function prevSlide() {
    if (isAnimating) return;

    const totalSteps = getTotalSteps();

    if (currentIndex <= 0) {
      // Está no início -> vai pro final
      goToSlide(totalSteps - 1);
    } else {
      goToSlide(currentIndex - 1);
    }
  }

  // Eventos dos botões
  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

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
    const walk = (x - startX) * 1.5;
    sliderTrack.scrollLeft = scrollLeft - walk;
  });

  // Snap para o slide mais próximo após drag
  function snapToNearestSlide() {
    const slideWidth = getSlideWidth();
    const totalSteps = getTotalSteps();
    const nearestIndex = Math.round(sliderTrack.scrollLeft / slideWidth);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, totalSteps - 1));
    goToSlide(clampedIndex);
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

  // Scroll com wheel - COM LOOP
  sliderTrack.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      if (Math.abs(e.deltaY) > 10) {
        e.preventDefault();
        if (e.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    },
    { passive: false },
  );

  // Navegação por teclado - COM LOOP
  document.addEventListener("keydown", (e) => {
    const projectsSection = document.querySelector("#myProjects");
    const rect = projectsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible && !isAnimating) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    }
  });

  // Atualizar ao redimensionar a janela
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      createIndicators(); // Recria indicadores para novo tamanho
      currentIndex = 0;
      goToSlide(0);
    }, 150);
  });
});
