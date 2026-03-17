document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  const chatbotContainer = document.getElementById('chatbot-container');
  const quoteForm = document.getElementById('quote-form');

  // --- Dynamic Folder Path Balancing ---
  // If we are inside the 'booking' folder, we need to step back one directory level ('../')
  // Otherwise, we look in the current directory ('./')
  const isBookingPage = window.location.pathname.includes('/booking');
  const rootPath = isBookingPage ? '../' : './';

  // --- 1. Load Header ---
  if (headerPlaceholder) {
    fetch(rootPath + 'header.html')
      .then(res => {
        if (!res.ok) throw new Error('Header HTML not found');
        return res.text();
      })
      .then(data => {
        // Inject data & replace {{ROOT}} with the correct path
        headerPlaceholder.innerHTML = data.replace(/\{\{ROOT\}\}/g, rootPath);
        initHeaderLogic(); // Initialize nav logic only AFTER header is in the DOM
      })
      .catch(err => console.error('Error loading header:', err));
  }

  // --- 2. Load Footer ---
  if (footerPlaceholder) {
    fetch(rootPath + 'footer.html')
      .then(res => res.text())
      .then(data => {
        // Inject data & replace {{ROOT}} with the correct path
        footerPlaceholder.innerHTML = data.replace(/\{\{ROOT\}\}/g, rootPath);
      })
      .catch(err => console.error('Error loading footer:', err));
  }

  // --- 3. Form Submission Microinteraction ---
  if (quoteForm) {
    quoteForm.addEventListener('submit', e => {
      // (Your existing form logic remains exactly the same here)
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = 'Sent! <i class="fas fa-check"></i>';
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          quoteForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // --- 4. Dynamically Load Chatbot ---
  if (chatbotContainer) {
    fetch(rootPath + 'chatbot.html') // Add rootPath so chatbot works from booking folder too
      .then(response => {
        if (!response.ok) throw new Error('Chatbot HTML not found');
        return response.text();
      })
      .then(data => {
        chatbotContainer.innerHTML = data.replace(/\{\{ROOT\}\}/g, rootPath);
        if (typeof initializeChatbot === 'function') {
          initializeChatbot();
        }
      })
      .catch(error => console.error('Error loading chatbot:', error));
  }

  // --- 5. Initialize Navigation & Active States ---
  function initHeaderLogic() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('header nav');
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('header nav a');
    let lastScrollY = window.pageYOffset;

    // Mobile Menu Toggle
    if (burger && nav) {
      burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.setAttribute('aria-expanded', nav.classList.contains('active'));
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    // Hide/Show Header on Scroll
    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset;
      if (nav && nav.classList.contains('active')) return;

      if (currentScrollY <= 80) {
        header?.classList.remove('hide');
      } else if (currentScrollY > lastScrollY) {
        header?.classList.add('hide');
      } else {
        header?.classList.remove('hide');
      }
      lastScrollY = currentScrollY;
    });

    // Active Page Highlighting based on URL
    const handlePageHighlighting = () => {
      const path = window.location.pathname;
      const currentFile = path.split('/').pop() || 'index.html'; // Fallback to index if empty

      navLinks.forEach(link => link.classList.remove('active'));

      if (isBookingPage) {
        const bookingLink = document.querySelector('nav a[href*="booking"]');
        if (bookingLink) bookingLink.classList.add('active');
      } else {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href.includes(currentFile)) {
            // Prevent marking "About" active just because we are on index.html
            if (currentFile === 'index.html' && href.includes('#about')) return;
            link.classList.add('active');
          }
        });
      }
    };
    handlePageHighlighting();

    // Intersection Observer for scrolling through Homepage sections
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          // Only perform scroll-highlighting if we are actually on the Home page
          if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`nav a[href*="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
          }
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(sec => observer.observe(sec));
  }
});