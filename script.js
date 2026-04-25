const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const year = document.getElementById('year');

const storedTheme = localStorage.getItem('resume-theme');
if (storedTheme === 'light') {
  root.classList.add('light');
}

themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  const mode = root.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('resume-theme', mode);
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    formStatus.textContent = 'Please complete all fields before sending.';
    return;
  }

  formStatus.textContent = 'Thanks! Your message has been recorded.';
  form.reset();
});

if (year) {
  year.textContent = String(new Date().getFullYear());
}
