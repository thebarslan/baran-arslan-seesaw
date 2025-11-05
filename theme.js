const themeInputs = document.querySelectorAll('input[name="theme"]');
const body = document.body;

themeInputs.forEach((input) => {
  input.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;

    body.classList.remove(
      "theme-sky",
      "theme-sun",
      "theme-forest",
      "theme-night"
    );

    body.classList.add(`theme-${selectedTheme}`);
  });
});
