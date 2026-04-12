document.addEventListener('DOMContentLoaded', () => {

    // ======== THEME TOGGLE LOGIC ========
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
        htmlEl.classList.remove('light');
    } else {
        htmlEl.classList.add('light');
        htmlEl.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (htmlEl.classList.contains('dark')) {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
            localStorage.theme = 'light';
        } else {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });

    // ======== FETCH DATA FROM JSON ========
    fetch('./data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            populateProfile(data.profile);
            populateSkills(data.skills);
            populateProjects(data.pbl_projects);
            populateEducation(data.education);
            populateCertificates(data.certificates);
            populateExperience(data.experience);
            populateSocials(data.social_media);

            // Execute Scroll Reveal after DOM is populated
            setTimeout(() => {
                initScrollReveal();
            }, 100);
        })
        .catch(error => {
            console.error("Gagal mendownload data.json:", error);
        });
});

// ======== SCROLL REVEAL LOGIC ========
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const options = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Runs only once per element
            }
        });
    }, options);

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Populate Profile Info
function populateProfile(profile) {
    if (!profile) return;

    const heroJudul = document.getElementById('heroJudul');
    if (heroJudul && profile.judul) heroJudul.textContent = profile.judul;

    // Stack layout hack for long text like TEKNIK INFORMATIKA DAN KOMPUTER
    const heroJurusanText = document.getElementById('heroJurusanText');
    if (heroJurusanText && profile.jurusan) {
        const words = profile.jurusan.split(' ');
        if (words.length >= 3) {
            const part1 = words.slice(0, 2).join(' ');
            const part2 = words.slice(2).join(' ');
            heroJurusanText.innerHTML = `<span>${part1}</span><span class="md:ml-32 mt-1 md:mt-0">${part2}</span>`;
        } else {
            heroJurusanText.textContent = profile.jurusan;
        }
    }

    document.getElementById('heroStatus').textContent = profile.status;
    document.getElementById('heroDept').textContent = profile.department;
    document.getElementById('heroProgram').textContent = profile.program;
    document.getElementById('cvLink').href = profile.cv_link;

    const aboutEl = document.getElementById('aboutText');
    if (aboutEl) aboutEl.textContent = profile.about;

    // Footer Bindings
    const footerName = document.getElementById('footerName');
    if (footerName) footerName.textContent = profile.name;

    const footerStatus = document.getElementById('footerStatus');
    if (footerStatus) footerStatus.textContent = `${profile.status} — ${profile.department}`;

    const footerCV = document.getElementById('footerCV');
    if (footerCV) footerCV.href = profile.cv_link;

    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = new Date().getFullYear();
}

// Populate Skills (Service Cards Style - Exact Layout based on Image)
function populateSkills(skills) {
    if (!skills) return;
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    container.innerHTML = '';

    skills.forEach((skill, index) => {
        container.innerHTML += `
            <div class="reveal group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)] xl:w-[calc(25%-2rem)] max-w-sm">
                <div class="bg-white dark:bg-dark-card p-8 md:p-10 h-full rounded-[40px] flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:shadow-primary-600/10 hover:-translate-y-4 border border-black/5 dark:border-white/5">
                    <!-- Icon with Primary Blue accent -->
                    <div class="relative mb-6 flex items-center justify-center">
                        <div class="absolute w-12 h-12 bg-primary-600/10 rounded-full blur-xl group-hover:bg-primary-600/20 transition-colors"></div>
                        <i class="ph ${skill.icon} text-5xl text-primary-600 relative z-10 group-hover:scale-110 transition-transform duration-500"></i>
                    </div>
                    
                    <h3 class="text-black dark:text-white font-sans font-black text-lg md:text-xl uppercase tracking-tighter group-hover:text-primary-600 transition-colors leading-tight">
                        ${skill.name}
                    </h3>
                </div>
            </div>
        `;
    });
}

// Populate PBL Projects
function populateProjects(projects) {
    if (!projects) return;
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    container.innerHTML = '';

    projects.forEach(project => {
        const matkulHTML = project.matkul ? `<div class="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Mata Kuliah: <span class="text-primary-600">${project.matkul}</span></div>` : '';

        container.innerHTML += `
            <a href="${project.link}" target="_blank" class="flex flex-col h-full group bg-white dark:bg-dark-card border border-black/10 dark:border-white/10 p-8 md:p-10 hover:shadow-2xl hover:-translate-y-2 transition-all block reveal">
                <div class="flex items-center gap-3 mb-4">
                    <span class="w-2 h-2 bg-primary-600 rounded-full"></span>
                    <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-400">${project.year}</span>
                </div>
                <h3 class="text-2xl md:text-3xl font-black mb-4 group-hover:text-primary-600 transition-colors tracking-tighter leading-tight">${project.title}</h3>
                ${matkulHTML}
                <p class="text-gray-500 text-sm leading-relaxed mt-auto pt-4">${project.description}</p>
            </a>
        `;
    });
}

// Populate Education
function populateEducation(eduList) {
    if (!eduList) return;
    const container = document.getElementById('educationContainer');
    if (!container) return;
    container.innerHTML = '';

    eduList.forEach(edu => {
        container.innerHTML += `
            <div class="group reveal h-full">
                <div class="flex flex-col h-full border-l-2 border-black/5 dark:border-white/5 pl-6 hover:border-primary-600 transition-colors duration-300">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">${edu.year}</div>
                    <h4 class="text-xl font-bold tracking-tight mb-2 group-hover:text-primary-600 transition-colors">${edu.institution}</h4>
                    <div class="text-primary-600 font-bold uppercase tracking-wider text-[10px] mb-3">${edu.degree}</div>
                    <p class="text-gray-500 text-sm leading-relaxed">${edu.description}</p>
                </div>
            </div>
        `;
    });
}

// Populate Certificates (Image Card Style)
function populateCertificates(certs) {
    if (!certs) return;
    const container = document.getElementById('certificatesContainer');
    if (!container) return;
    container.innerHTML = '';

    certs.forEach(cert => {
        const aspectClass = cert.type === 'portrait' ? 'aspect-[1/1.4]' : 'aspect-[1.4/1]';
        
        container.innerHTML += `
            <div class="reveal group">
                <div class="bg-white dark:bg-dark-card border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <!-- Image Container with Orientation Logic -->
                    <div class="relative ${aspectClass} overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="${cert.image}" alt="${cert.title}" 
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-colors duration-500"></div>
                        
                        <!-- Overlay Year Tag -->
                        <div class="absolute top-4 right-4 bg-white/90 dark:bg-dark-card/90 px-3 py-1 text-[10px] font-black tracking-widest uppercase backdrop-blur-sm border border-black/5">
                            ${cert.year}
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div class="p-6">
                        <h4 class="font-black text-lg tracking-tighter uppercase leading-tight group-hover:text-primary-600 transition-colors mb-2">
                            ${cert.title}
                        </h4>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            ${cert.issuer}
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Populate Experience (Modern List Style)
function populateExperience(expList) {
    if (!expList) return;
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    container.innerHTML = '';

    const typeColors = {
        'PKL': 'bg-primary-600 text-white',
        'Organisasi': 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white',
        'Panitia': 'bg-black dark:bg-white text-white dark:text-black',
        'Teamwork': 'border border-primary-600 text-primary-600'
    };

    const typeIcons = {
        'PKL': 'ph-briefcase',
        'Organisasi': 'ph-users',
        'Panitia': 'ph-megaphone',
        'Teamwork': 'ph-users-three'
    };

    expList.forEach(exp => {
        const colorClass = typeColors[exp.type] || 'bg-gray-100 dark:bg-gray-800';
        const iconClass = typeIcons[exp.type] || 'ph-star';

        container.innerHTML += `
            <div class="reveal group">
                <div class="bg-white dark:bg-dark-card border border-black/5 dark:border-white/5 p-8 h-full transition-all duration-500 hover:shadow-xl hover:border-primary-600/30">
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-12 h-12 rounded-2xl bg-primary-600/5 flex items-center justify-center text-primary-600">
                            <i class="ph ${iconClass} text-2xl"></i>
                        </div>
                        <span class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${colorClass}">
                            ${exp.type}
                        </span>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="text-xl font-bold tracking-tight mb-1 group-hover:text-primary-600 transition-colors">${exp.role}</h4>
                        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">${exp.company}</p>
                    </div>
                    
                    <div class="text-[10px] font-bold text-primary-600/60 uppercase tracking-widest mb-4">
                        ${exp.period}
                    </div>
                    
                    <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        ${exp.description}
                    </p>
                </div>
            </div>
        `;
    });
}

// Populate Social Media
function populateSocials(socials) {
    if (!socials) return;

    // 1. Populate Footer
    const footerContainer = document.getElementById('socialContainer');
    if (footerContainer) {
        footerContainer.innerHTML = '';
        socials.forEach(social => {
            footerContainer.innerHTML += `
                <a href="${social.link}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-primary-600 text-gray-400 hover:text-white transition-all shadow-sm">
                    <i class="ph ${social.icon} text-xl"></i>
                </a>
            `;
        });
    }

    // 2. Populate Infinite Marquee
    const marqueeContainer = document.getElementById('marqueeContainer');
    if (marqueeContainer) {
        let marqueeBlockHTML = '<div class="flex items-center gap-16 md:gap-32 px-8 md:px-16">';
        socials.forEach(social => {
            marqueeBlockHTML += `
                <a href="${social.link}" target="_blank" class="flex items-center gap-3 text-black/40 dark:text-white/40 hover:text-primary-600 dark:hover:text-white transition-colors cursor-pointer group">
                    <i class="ph ${social.icon} text-3xl group-hover:scale-110 transition-transform"></i>
                    <span class="font-bold tracking-widest uppercase text-xs md:text-sm">${social.platform}</span>
                </a>
            `;
        });
        marqueeBlockHTML += '</div>';

        const groupHTML = '<div class="flex items-center justify-start">' + marqueeBlockHTML + marqueeBlockHTML + '</div>';
        marqueeContainer.innerHTML = groupHTML + groupHTML;
    }

    // ======== PREMIUM POLISH: SCROLL PROGRESS & BACK TO TOP ========
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.pageYOffset / totalHeight) * 100;
        if (scrollProgress) scrollProgress.style.width = scrollPercent + '%';

        if (backToTop) {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ======== PREMIUM POLISH: MOBILE MENU TOGGLE ========
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu(forceClose = false) {
        if (forceClose) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
            return;
        }
        const isOpen = mobileMenu.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => toggleMenu());
    }
    
    // Close on Backdrop Click
    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.addEventListener('click', () => toggleMenu(true));
    }

    // Close on Close Button Click
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => toggleMenu(true));
    }

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // ======== PREMIUM POLISH: COUNTUP ANIMATION ========
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = Math.floor(progress * (end - start) + start);
            obj.innerHTML = currentVal + (end > 0 && obj.innerHTML.includes('+') ? '+' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const countTarget = document.querySelector('#about');
    if (countTarget) {
        const stats = countTarget.querySelectorAll('h3');
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(stat => {
                        const finalValue = parseInt(stat.textContent);
                        if (!isNaN(finalValue)) {
                            animateValue(stat, 0, finalValue, 2000);
                        }
                    });
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        countObserver.observe(countTarget);
    }
}
