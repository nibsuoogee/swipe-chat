const checkbox = document.getElementById('toggle-dark-mode');
let storedTheme = localStorage.getItem('theme') ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark" : "light");
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme);
}
if (storedTheme === "dark") {
  checkbox.checked = true;
}
else {
  checkbox.checked = false;
}
function toggleDarkMode() {
  let targetTheme = "light";
  if (checkbox && checkbox.checked) {
    targetTheme = "dark";
  }
  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('theme', targetTheme);
}