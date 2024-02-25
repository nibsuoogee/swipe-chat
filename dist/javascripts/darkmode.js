let storedTheme = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
}

function toggleDarkMode() {
    const checkbox = document.getElementById('toggle-dark-mode');
    let targetTheme = "light";
    if (checkbox.checked == true) {
        targetTheme = "dark";
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
}

console.log("script ready")