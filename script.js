const resumeTemplateData = {
  basics: {
    name: 'Alex Morgan',
    title: 'Full-Stack Developer',
    location: 'Austin, TX',
    yearsExperience: '6+ years',
    email: 'alex@example.com',
    portfolio: 'https://portfolio.example.com',
    github: 'https://github.com/alexmorgan'
  },
  summaryByRole: {
    'Full-Stack Developer': 'Full-stack developer who ships user-focused products, improves system reliability, and delivers measurable business outcomes.',
    'Frontend Engineer': 'Frontend engineer specializing in accessible, performant interfaces that improve activation and retention metrics.',
    'Backend Engineer': 'Backend engineer focused on API reliability, database performance, and cloud architecture that scales with demand.'
  },
  strategy: [
    {
      title: 'Keep it clear and focused',
      bullets: ['Use a clean layout.', 'Remove non-relevant details.', 'Lead with what hiring teams care about first.']
    },
    {
      title: 'Show tangible results',
      bullets: ['Use metrics for impact.', 'Highlight outcomes, not tasks.', 'Quantify growth, speed, and quality improvements.']
    },
    {
      title: 'Write a strong summary',
      bullets: ['Show top skills.', 'Align to your target role.', 'Use role-specific keywords.']
    },
    {
      title: 'List relevant skills & tools',
      bullets: ['Mirror job-post terms.', 'Include technical and soft skills.', 'Prioritize recent, practical tools.']
    },
    {
      title: 'Back it up with proof',
      bullets: ['Add GitHub and portfolio links.', 'Include project outcomes.', 'Provide concrete work examples.']
    },
    {
      title: 'Tailor for each role',
      bullets: ['Customize each submission.', 'Mirror the job description.', 'Adapt summary, skills, and bullets to fit.']
    }
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Docker',
    'AWS',
    'CI/CD',
    'Jest',
    'Communication',
    'Leadership'
  ],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'BrightStack',
      period: '2022 — Present',
      outcomes: [
        'Improved release velocity by 35% by introducing micro-frontend delivery workflows.',
        'Reduced UI defects by 28% by launching a shared design system used by 5 teams.',
        'Cut mean time to recovery by 42% through observability and incident review practices.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Northshore Labs',
      period: '2019 — 2022',
      outcomes: [
        'Increased reporting adoption by 50% after shipping analytics dashboards for enterprise users.',
        'Reduced deployment failures by 40% through CI/CD automation and release checklists.',
        'Raised Lighthouse accessibility scores from 71 to 96 across customer-facing pages.'
      ]
    }
  ],
  proofLinks: [
    {
      name: 'Portfolio',
      url: 'https://portfolio.example.com',
      detail: 'Case studies with measurable outcomes and implementation notes.'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/alexmorgan',
      detail: 'Production-like code samples, testing patterns, and documentation.'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/alexmorgan',
      detail: 'Recommendations and role history aligned to target positions.'
    }
  ]
};

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const year = document.getElementById('year');
const candidateName = document.getElementById('candidateName');
const candidateTitle = document.getElementById('candidateTitle');
const candidateSummary = document.getElementById('candidateSummary');
const quickFacts = document.getElementById('quickFacts');
const strategyGrid = document.getElementById('strategyGrid');
const skillsList = document.getElementById('skillsList');
const experienceList = document.getElementById('experienceList');
const proofLinks = document.getElementById('proofLinks');
const summaryRole = document.getElementById('summaryRole');
const tailorForm = document.getElementById('tailorForm');
const tailorStatus = document.getElementById('tailorStatus');
const jobDescription = document.getElementById('jobDescription');
const matchedKeywords = document.getElementById('matchedKeywords');

function renderBasics() {
  const { basics, summaryByRole } = resumeTemplateData;
  const roleOptions = Object.keys(summaryByRole);

  candidateName.textContent = basics.name;
  candidateTitle.textContent = basics.title;
  roleOptions.forEach((role) => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    if (role === basics.title) option.selected = true;
    summaryRole?.append(option);
  });

  candidateSummary.textContent = summaryByRole[basics.title] || roleOptions[0];
  quickFacts.innerHTML = `
    <li><strong>Location:</strong> ${basics.location}</li>
    <li><strong>Experience:</strong> ${basics.yearsExperience}</li>
    <li><strong>Email:</strong> ${basics.email}</li>
    <li><strong>Portfolio:</strong> <a href="${basics.portfolio}">View</a></li>
  `;
}

function renderStrategy() {
  resumeTemplateData.strategy.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';

    const bullets = item.bullets.map((bullet) => `<li>${bullet}</li>`).join('');
    card.innerHTML = `<h3>${item.title}</h3><ul>${bullets}</ul>`;
    strategyGrid?.append(card);
  });
}

function renderSkills() {
  resumeTemplateData.skills.forEach((skill) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = skill;
    skillsList?.append(chip);
  });
}

function renderExperience() {
  resumeTemplateData.experience.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'timeline-item';
    article.innerHTML = `
      <div>
        <h3>${item.role} · ${item.company}</h3>
        <p class="meta">${item.period}</p>
      </div>
      <ul>${item.outcomes.map((outcome) => `<li>${outcome}</li>`).join('')}</ul>
    `;
    experienceList?.append(article);
  });
}

function renderProof() {
  resumeTemplateData.proofLinks.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.detail}</p>
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a>
    `;
    proofLinks?.append(card);
  });
}

function handleSummaryRoleChange() {
  summaryRole?.addEventListener('change', (event) => {
    const selected = event.target.value;
    candidateSummary.textContent = resumeTemplateData.summaryByRole[selected];
  });
}

function handleTailoring() {
  tailorForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const description = jobDescription?.value.trim() || '';

    if (description.length < 30) {
      tailorStatus.textContent = 'Please provide a fuller job description (at least 30 characters).';
      return;
    }

    const normalized = description.toLowerCase();
    const matched = resumeTemplateData.skills.filter((skill) =>
      normalized.includes(skill.toLowerCase())
    );

    matchedKeywords.innerHTML = '';
    const keywords = matched.length ? matched : ['No direct match found', 'Add role-specific keywords'];

    keywords.forEach((keyword) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = keyword;
      matchedKeywords.append(chip);
    });

    tailorStatus.textContent = `Matched ${matched.length} keyword${matched.length === 1 ? '' : 's'}. Update summary and bullets to mirror the role.`;
  });
}

function restoreTheme() {
  const storedTheme = localStorage.getItem('resume-theme');
  if (storedTheme === 'light') {
    root.classList.add('light');
  }
}

function handleThemeToggle() {
  themeToggle?.addEventListener('click', () => {
    root.classList.toggle('light');
    const mode = root.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('resume-theme', mode);
  });
}

function renderYear() {
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

function init() {
  renderBasics();
  renderStrategy();
  renderSkills();
  renderExperience();
  renderProof();
  handleSummaryRoleChange();
  handleTailoring();
  restoreTheme();
  handleThemeToggle();
  renderYear();
}

init();
