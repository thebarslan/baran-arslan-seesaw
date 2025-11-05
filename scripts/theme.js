const themeInputs = document.querySelectorAll('input[name="theme"]');
const body = document.body;

const savedTheme = localStorage.getItem("selectedTheme");
if (savedTheme) {
  body.classList.add(`theme-${savedTheme}`);
  const savedInput = document.querySelector(`input[value="${savedTheme}"]`);
  if (savedInput) savedInput.checked = true;
} else {
  body.classList.add("theme-sky");
  localStorage.setItem("selectedTheme", "sky");
}

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

    localStorage.setItem("selectedTheme", selectedTheme);
  });
});
