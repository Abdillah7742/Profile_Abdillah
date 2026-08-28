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

    function updatePlaceholderImages(isDark) {
        const placeholderImages = document.querySelectorAll('img[src*="placehold.co"]');
        placeholderImages.forEach(img => {
            let src = img.src;
            if (isDark) {
                src = src.replace('/f3f4f6/1e293b', '/0f172a/ffffff');
            } else {
                src = src.replace('/0f172a/ffffff', '/f3f4f6/1e293b');
            }
            img.src = src;
        });

        // Update skill logos dynamically
        const skillLogos = document.querySelectorAll('img.skill-logo');
        skillLogos.forEach(img => {
            const lightSrc = img.getAttribute('data-light');
            const darkSrc = img.getAttribute('data-dark');
            if (isDark && darkSrc) {
                img.src = darkSrc;
            } else if (!isDark && lightSrc) {
                img.src = lightSrc;
            }
        });
    }

    themeToggleBtn.addEventListener('click', () => {
        if (htmlEl.classList.contains('dark')) {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
            localStorage.theme = 'light';
            updatePlaceholderImages(false);
        } else {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
            localStorage.theme = 'dark';
            updatePlaceholderImages(true);
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
            window.allProjects = data.pbl_projects; // Store globally for modal access
            populateProjects(data.pbl_projects);
            populateEducation(data.education);
            populateCertificates(data.certificates);
            populateExperience(data.experience);
            populateSocials(data.social_media);

            initModal(); // Initialize modal events

            // Populate dynamic stats counts
            if (data.pbl_projects) {
                const statProjects = document.getElementById('statProjects');
                if (statProjects) statProjects.textContent = `${data.pbl_projects.length}+`;
            }
            if (data.certificates) {
                const statCertificates = document.getElementById('statCertificates');
                if (statCertificates) statCertificates.textContent = `${data.certificates.length}+`;
            }

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

    // Dynamic stats
    const statSemester = document.getElementById('statSemester');
    if (statSemester && profile.semester) {
        statSemester.textContent = profile.semester;
    }

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

    skills.forEach((skill) => {
        // Generate logo items list
        let itemsHtml = '';
        if (skill.items && skill.items.length > 0) {
            const isDark = document.documentElement.classList.contains('dark');
            skill.items.forEach(item => {
                const lightLogo = item.logo_light || item.logo;
                const darkLogo = item.logo_dark || item.logo;
                const activeSrc = isDark ? darkLogo : lightLogo;

                itemsHtml += `
                    <div class="group/item flex flex-col items-center gap-1.5">
                        <div class="w-14 h-14 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 p-3 rounded-2xl shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative">
                            <img src="${activeSrc}" data-light="${lightLogo}" data-dark="${darkLogo}" alt="${item.name}" class="skill-logo w-8 h-8 object-contain">
                            <!-- Tooltip -->
                            <span class="absolute -top-10 bg-slate-950 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity duration-300 whitespace-nowrap z-30 shadow-md">
                                ${item.name}
                            </span>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML += `
            <div class="reveal group w-full sm:w-[calc(50%-1.5rem)] xl:w-[calc(25%-1.5rem)] max-w-sm">
                <div class="bg-white dark:bg-[#0b0f19] p-8 md:p-10 h-full rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:shadow-primary-600/5 hover:-translate-y-2 border border-black/5 dark:border-white/5 relative overflow-hidden">
                    <!-- Subtle gradient overlay on hover -->
                    <div class="absolute inset-0 bg-gradient-to-br from-primary-600/0 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <!-- Category Icon Container -->
                    <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10 transition-transform duration-500 group-hover:scale-105">
                        <i class="ph ${skill.icon} text-4xl text-primary-600"></i>
                    </div>

                    <!-- Title -->
                    <h3 class="text-slate-900 dark:text-white font-sans font-black text-lg md:text-xl tracking-tight mb-6 relative z-10">
                        ${skill.name}
                    </h3>

                    <!-- Logos Row -->
                    <div class="flex flex-wrap items-center justify-center gap-3 mt-auto relative z-10 w-full">
                        ${itemsHtml}
                    </div>
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

    projects.forEach((project, index) => {
        container.innerHTML += `
            <div onclick="openProjectModal(${index})" class="cursor-pointer relative group aspect-[16/9] rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 reveal">
                <!-- Background Image -->
                <img src="${project.image}" alt="${project.title}" onerror="this.src = document.documentElement.classList.contains('dark') ? 'https://placehold.co/640x360/0f172a/ffffff?text=${encodeURIComponent(project.title)}' : 'https://placehold.co/640x360/f3f4f6/1e293b?text=${encodeURIComponent(project.title)}'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                
                <!-- Floating Info Panel Overlay -->
                <div class="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-white/20 dark:border-white/5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <div class="flex flex-col pr-4">
                        <h3 class="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                            ${project.title}
                        </h3>
                        <span class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                            ${project.category || 'WEB DEVELOPMENT'}
                        </span>
                    </div>
                    
                    <!-- Round Arrow Button -->
                    <div class="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-900 dark:text-white transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 flex-shrink-0">
                        <i class="ph ph-arrow-up-right text-base md:text-lg font-bold"></i>
                    </div>
                </div>
            </div>
        `;
    });
}

// ======== PROJECT MODAL LOGIC ========
window.openProjectModal = function(index) {
    const project = window.allProjects[index];
    if (!project) return;

    // Fill elements
    document.getElementById('modalImage').src = project.image;
    document.getElementById('modalImage').onerror = function() {
        const isDark = document.documentElement.classList.contains('dark');
        this.src = isDark 
            ? `https://placehold.co/640x360/0f172a/ffffff?text=${encodeURIComponent(project.title)}`
            : `https://placehold.co/640x360/f3f4f6/1e293b?text=${encodeURIComponent(project.title)}`;
    };
    document.getElementById('modalCategory').textContent = project.category || 'WEB DEVELOPMENT';
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;

    // Set modal logos (Light and Dark versions side by side)
    const logosContainer = document.getElementById('modalLogosContainer');
    const logoLight = document.getElementById('modalLogoLight');
    const logoDark = document.getElementById('modalLogoDark');
    
    if (project.logo_light && project.logo_dark) {
        logoLight.src = project.logo_light;
        logoDark.src = project.logo_dark;
        logosContainer.classList.remove('hidden');
    } else {
        logosContainer.classList.add('hidden');
    }

    // Features
    const featuresList = document.getElementById('modalFeaturesList');
    featuresList.innerHTML = '';
    if (project.features && project.features.length > 0) {
        document.getElementById('modalFeaturesContainer').style.display = 'flex';
        project.features.forEach(feat => {
            featuresList.innerHTML += `
                <li class="flex items-start gap-2 text-slate-600 dark:text-gray-300">
                    <span class="text-primary-600 font-black mr-1">•</span>
                    <span>${feat}</span>
                </li>
            `;
        });
    } else {
        document.getElementById('modalFeaturesContainer').style.display = 'none';
    }

    // Tech tags
    const techContainer = document.getElementById('modalTechContainer');
    techContainer.innerHTML = '';
    if (project.technologies && project.technologies.length > 0) {
        project.technologies.forEach(tech => {
            techContainer.innerHTML += `
                <span class="text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 px-3 py-1.5 rounded-lg">
                    ${tech}
                </span>
            `;
        });
    }

    // Demo Link
    const demoLink = document.getElementById('modalDemoLink');
    if (project.link && project.link !== '#') {
        demoLink.href = project.link;
        demoLink.style.display = 'flex';
    } else {
        demoLink.style.display = 'none';
    }

    // Show modal with animation
    const modal = document.getElementById('projectModal');
    const content = document.getElementById('modalContent');
    
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.classList.add('opacity-100');
    content.classList.remove('scale-95', 'opacity-0');
    content.classList.add('scale-100', 'opacity-100');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    const content = document.getElementById('modalContent');
    
    modal.classList.remove('opacity-100');
    modal.classList.add('pointer-events-none', 'opacity-0');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    // Restore body scroll
    document.body.style.overflow = '';
};

// ======== IMAGE VIEWER LIGHTBOX LOGIC ========
window.openImageViewer = function(elementId) {
    const targetId = elementId || 'modalImage';
    const modalImgSrc = document.getElementById(targetId).src;
    document.getElementById('viewerImage').src = modalImgSrc;
    
    const viewer = document.getElementById('imageViewerModal');
    viewer.classList.remove('pointer-events-none');
    viewer.classList.add('opacity-100');
};

window.closeImageViewer = function() {
    const viewer = document.getElementById('imageViewerModal');
    viewer.classList.remove('opacity-100');
    viewer.classList.add('pointer-events-none');
};

function initModal() {
    const closeModalBtn = document.getElementById('closeModalBtn');
    const backdrop = document.getElementById('modalBackdrop');
    const viewerBackdrop = document.getElementById('imageViewerModal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', window.closeProjectModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', window.closeProjectModal);
    }
    if (viewerBackdrop) {
        viewerBackdrop.addEventListener('click', (e) => {
            // Close lightbox only when clicking the backdrop (outside the image container itself)
            if (e.target.id === 'imageViewerModal') {
                window.closeImageViewer();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const viewer = document.getElementById('imageViewerModal');
            if (viewer && viewer.classList.contains('opacity-100')) {
                window.closeImageViewer();
            } else {
                window.closeProjectModal();
            }
        }
    });
}

// Populate Education
function populateEducation(eduList) {
    if (!eduList) return;
    const container = document.getElementById('educationContainer');
    if (!container) return;
    
    // Build vertical timeline (Chronological: oldest at the top to newest at the bottom)
    let html = `
        <div class="relative w-full max-w-[105rem] mx-auto py-10 px-4 md:px-8">
            <!-- Central Vertical Line -->
            <div class="absolute left-6 md:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-800"></div>
            
            <div class="relative flex flex-col gap-12 md:gap-8 w-full">
    `;

    eduList.forEach((edu, index) => {
        const isLeft = index % 2 === 0;
        // Extract start year for the node circle
        const startYear = edu.year.split(' ')[0] || edu.year;

        html += `
            <div class="relative w-full reveal">
                <!-- Central Year Circle Node Badge -->
                <div class="absolute left-6 md:left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-center top-6 md:top-1/2 md:-translate-y-1/2">
                    <div class="w-12 h-12 rounded-full bg-white dark:bg-[#0b0f19] border-2 border-primary-600 shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-110">
                        <span class="text-xs font-black text-slate-800 dark:text-white">${startYear}</span>
                    </div>
                </div>
                
                <!-- Grid Container (2 columns on desktop) -->
                <div class="grid grid-cols-1 md:grid-cols-2 w-full gap-8 md:gap-12">
                    <!-- Left Column -->
                    <div class="${isLeft ? 'pl-16 md:pl-0 md:pr-8 text-left md:text-right' : 'hidden md:block md:opacity-0 md:pointer-events-none'}">
                        <div class="bg-white dark:bg-[#0b0f19] p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-block w-full text-left">
                            <span class="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2">${edu.year}</span>
                            <h4 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">${edu.institution}</h4>
                            <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">${edu.degree}</div>
                            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">${edu.description}</p>
                        </div>
                    </div>
                    
                    <!-- Right Column -->
                    <div class="${!isLeft ? 'pl-16 md:pl-8 text-left' : 'hidden md:block md:opacity-0 md:pointer-events-none'}">
                        <div class="bg-white dark:bg-[#0b0f19] p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-block w-full">
                            <span class="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2">${edu.year}</span>
                            <h4 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">${edu.institution}</h4>
                            <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">${edu.degree}</div>
                            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">${edu.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    container.innerHTML = html;
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
// Populate Experience (Grouped Category Layout)
function populateExperience(expList) {
    if (!expList) return;
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    container.innerHTML = '';
    
    // Change container class to behave as full width flex stack instead of default grid
    container.className = "flex flex-col gap-20 w-full text-left";

    const categories = {
        'technical': 'Technical & Event Production',
        'service': 'Lecturer Community Service Projects',
        'campus': 'Leadership, Organization & Events'
    };

    const typeIcons = {
        'technical': 'ph-cpu',
        'service': 'ph-chalkboard-teacher',
        'campus': 'ph-users-three'
    };

    // Group items
    const grouped = {
        'technical': [],
        'service': [],
        'campus': []
    };

    expList.forEach(exp => {
        if (grouped[exp.category]) {
            grouped[exp.category].push(exp);
        } else {
            grouped['campus'].push(exp);
        }
    });

    // Render grouped layout
    for (const key in grouped) {
        const items = grouped[key];
        if (items.length === 0) continue;

        const categoryTitle = categories[key];
        const categoryIcon = typeIcons[key];

        let itemsHtml = '';
        items.forEach(exp => {
            itemsHtml += `
                <div class="group bg-white dark:bg-[#0b0f19] border border-black/5 dark:border-white/10 p-8 rounded-3xl transition-all duration-500 hover:shadow-xl hover:border-primary-600/30 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div class="flex justify-between items-center mb-5">
                            <span class="text-[9px] font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-600/10 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full border border-primary-100/50 dark:border-primary-500/10">
                                ${exp.period}
                            </span>
                        </div>
                        
                        <h4 class="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">${exp.role}</h4>
                        <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">${exp.company}</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">${exp.description}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="reveal w-full">
                <!-- Group Subheader Header -->
                <div class="flex items-center gap-4 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                    <div class="w-11 h-11 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                        <i class="ph ${categoryIcon} text-xl"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-sans font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        ${categoryTitle}
                    </h3>
                </div>
                
                <!-- Category Grid Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }
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
