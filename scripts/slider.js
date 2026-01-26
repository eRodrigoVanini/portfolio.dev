document.addEventListener("DOMContentLoaded", () => {
  const sliderTrack = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slider-track .card-projects");
  const prevBtn = document.querySelector(".slider-btn-prev");
  const nextBtn = document.querySelector(".slider-btn-next");
  const indicatorsContainer = document.querySelector(".slider-indicators");

  if (!sliderTrack || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

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

  // Atualizar indicadores ativos
  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  // Navegar para um slide específico
  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    currentIndex = index;
    const slide = slides[currentIndex];

    slide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    updateIndicators();
  }

  // Eventos dos botões de navegação
  prevBtn.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
  });

  // Detectar scroll manual para atualizar indicadores
  let scrollTimeout;
  sliderTrack.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = sliderTrack.scrollLeft;
      const slideWidth = slides[0].offsetWidth + 20; // width + gap
      const newIndex = Math.round(scrollLeft / slideWidth);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < totalSlides
      ) {
        currentIndex = newIndex;
        updateIndicators();
      }
    }, 50);
  });

  // Navegação por teclado quando a seção está visível
  document.addEventListener("keydown", (e) => {
    const projectsSection = document.querySelector("#myProjects");
    const rect = projectsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      }
    }
  });

  // Suporte a gestos touch/swipe
  let touchStartX = 0;
  let touchEndX = 0;

  sliderTrack.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  sliderTrack.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }
});
