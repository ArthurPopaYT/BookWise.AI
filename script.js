// Smooth scroll function
function scrollToDemo() {
    document.querySelector('#demo').scrollIntoView({
        behavior: 'smooth'
    });
}

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
let conversationState = 'initial';
let selectedService = '';
let selectedDate = '';
let selectedTime = '';

// Add loading animation
function addLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading';
    loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

// Update addMessage function
function addMessage(message, isUser = false) {
    const loadingDiv = !isUser ? addLoadingAnimation() : null;
    
    setTimeout(() => {
        if (loadingDiv) {
            loadingDiv.remove();
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = message;
        
        // Add data-lang-key for bot messages
        if (!isUser) {
            messageDiv.setAttribute('data-lang-key', 'chat.welcome');
        }
        
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, isUser ? 0 : 1000);
}

// Process user input
function processUserInput(input) {
    switch(conversationState) {
        case 'initial':
            if (input === '1') {
                conversationState = 'selecting_service';
                addMessage(botResponses.services);
            } else {
                addMessage("I'm sorry, that option is not available yet. Please select option 1 to book an appointment.");
            }
            break;
            
        case 'selecting_service':
            if (['1', '2', '3', '4'].includes(input)) {
                selectedService = input;
                conversationState = 'selecting_date';
                addMessage(botResponses.dates);
            } else {
                addMessage("Please select a valid service number (1-4).");
            }
            break;
            
        case 'selecting_date':
            if (['1', '2', '3', '4'].includes(input)) {
                selectedDate = input;
                conversationState = 'selecting_time';
                const availableTimes = botResponses.times[input].join(", ");
                addMessage(`Available times for your selected date: ${availableTimes}\n\nPlease type your preferred time (e.g., "14:00")`);
            } else {
                addMessage("Please select a valid date option (1-4).");
            }
            break;
            
        case 'selecting_time':
            if (botResponses.times[selectedDate].includes(input)) {
                selectedTime = input;
                conversationState = 'confirmed';
                addMessage(`Great! Your appointment has been confirmed:
                
Service: ${getServiceName(selectedService)}
Date: ${getDateText(selectedDate)}
Time: ${selectedTime}

You will receive a confirmation message shortly. Would you like to book another appointment? (Type 'yes' or 'no')`);
            } else {
                addMessage("Please select a valid time from the available options.");
            }
            break;
            
        case 'confirmed':
            if (input.toLowerCase() === 'yes') {
                conversationState = 'initial';
                addMessage(botResponses.welcome);
            } else {
                addMessage("Thank you for booking with us! Have a great day! 👋");
            }
            break;
    }
}

// Helper functions
function getServiceName(serviceNumber) {
    const services = {
        "1": "Haircut",
        "2": "Massage",
        "3": "Consultation",
        "4": "Beauty Treatment"
    };
    return services[serviceNumber];
}

function getDateText(dateNumber) {
    const dates = {
        "1": "Today",
        "2": "Tomorrow",
        "3": "Day after tomorrow",
        "4": "Next week"
    };
    return dates[dateNumber];
}

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        processUserInput(message);
        userInput.value = '';
    }
}

// Initialize chat
window.onload = function() {
    addMessage(botResponses.welcome);
}

// Handle enter key
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add scroll animation for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Update the navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a:not(.cta-button)');
    const logoText = document.querySelector('.logo-text');
    
    if (window.scrollY > 50) {
        navbar.style.background = '#ffffff';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        // Change text color to dark when background is white
        navLinks.forEach(link => link.style.color = 'var(--text-dark)');
        logoText.style.color = 'var(--text-dark)';
        logoText.querySelector('.ai-text').style.color = 'var(--primary-color)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
        // Revert text color to light when background is transparent
        navLinks.forEach(link => link.style.color = 'var(--text-light)');
        logoText.style.color = 'var(--text-light)';
        logoText.querySelector('.ai-text').style.color = 'var(--primary-color)';
    }
});

// Contact Form Handler
document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const topic = this.querySelector('select').value;
    const message = this.querySelector('textarea').value;

    // Simple validation
    if (!name || !email || !topic || !message) {
        alert('Please fill in all fields');
        return;
    }

    // Here you would typically send this to your backend
    console.log('Form submitted:', { name, email, topic, message });
    
    // Show success message
    alert('Thank you for your message. We will get back to you soon!');
    
    // Reset form
    this.reset();
});

// Pricing toggle handler (if you want to add monthly/yearly toggle)
document.querySelectorAll('.pricing-cta').forEach(button => {
    button.addEventListener('click', function() {
        if (this.textContent === 'Contact Sales') {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Handle other pricing buttons
            alert('Thank you for your interest! Please contact our sales team to get started.');
        }
    });
});

// Update translations object with all website content
const translations = {
    en: {
        pageTitle: "WhatsApp Appointment Automation",
        chat: {
            inputPlaceholder: "Type a message...",
            assistantName: "Your Business",
            welcome: "Type a message to start the conversation. I can help you schedule an appointment - just tell me when you'd like to come.",
            availableSlots: "I have these slots available",
            confirmationRequest: "Would you like to confirm this appointment?",
            bookingConfirmed: "Perfect! Your appointment is confirmed! 🤝",
            bookingCancelled: "No problem! Let me know if you'd like to check other time slots.",
            features: {
                title: "Complete Version Features",
                subtitle: "The complete version includes:",
                list: [
                    "Real Google Calendar Integration",
                    "Real-time Availability Check",
                    "Advanced User Intent Detection",
                    "Multiple Appointment Management",
                    "Cancellation and Rescheduling",
                    "Automatic Reminders",
                    "Complete Message Customization",
                    "Integration with Your Booking System",
                    "Multi-language Support",
                    "Reports and Analytics"
                ]
            }
        },
        nav: {
            features: "Features",
            demo: "Demo",
            howItWorks: "How It Works",
            pricing: "Pricing",
            testimonials: "Testimonials",
            contact: "Contact Us"
        },
        hero: {
            title: "Seamless WhatsApp Booking. Smart Scheduling. Effortless Management.",
            subtitle: "Automate appointment scheduling directly through WhatsApp and sync effortlessly with Google Calendar.",
            cta: {
                primary: "Get Started",
                secondary: "Learn More"
            }
        },
        features: {
            title: "Powerful Features for Your Business",
            cards: {
                whatsapp: {
                    title: "WhatsApp Integration",
                    items: [
                        "Direct appointment booking",
                        "Auto-replies and confirmations",
                        "Intelligent chatbot assistance"
                    ]
                },
                calendar: {
                    title: "Google Calendar Sync",
                    items: [
                        "Automatic booking sync",
                        "Conflict detection",
                        "Smart rescheduling"
                    ]
                }
            }
        },
        howItWorks: {
            title: "How It Works",
            steps: [
                {
                    title: "1. Start a Chat",
                    description: "Send a message to our WhatsApp business number to begin the booking process."
                },
                {
                    title: "2. Choose Your Time",
                    description: "Our AI assistant will help you find and select the perfect time slot that works for you."
                },
                {
                    title: "3. Instant Confirmation",
                    description: "Receive immediate confirmation and get your appointment added to our system."
                },
                {
                    title: "4. Get Reminders",
                    description: "Receive automatic reminders before your appointment via WhatsApp."
                },
                {
                    title: "5. Easy Management",
                    description: "Cancel or reschedule your appointment with just a few messages."
                }
            ]
        },
        pricing: {
            title: "Choose Your Plan",
            cards: [
                {
                    title: "Basic",
                    price: "$29",
                    period: "/month",
                    features: [
                        "Up to 200 appointments/month",
                        "WhatsApp Integration",
                        "Google Calendar Integration",
                        "Basic Analytics",
                        "Robotic responses, but they do their job",
                        "Email Support"
                    ],
                    cta: "Get Started"
                },
                {
                    title: "Professional",
                    price: "$49",
                    period: "/month",
                    features: [
                        "Up to 1000 appointments/month",
                        "Advanced Analytics",
                        "Custom Integrations",
                        "Advanced AI Assistant",
                        "Human-like responses",
                        "Optional Custom Notifications"
                    ],
                    cta: "Get Started"
                },
                {
                    title: "Enterprise",
                    price: "~$99+",
                    period: "/month",
                    features: [
                        "Unlimited appointments",
                        "Multiple Staff Accounts",
                        "Priority Support (Email & SMS/WhatsApp)",
                        "Dedicated Account Manager",
                        "24/7 Phone Support"
                    ],
                    cta: "Contact Us"
                }
            ]
        },
        contact: {
            title: "Get In Touch",
            subtitle: "Have questions about our services? We're here to help!",
            form: {
                name: "Your Name",
                email: "Your Email",
                topic: {
                    label: "Select Topic",
                    options: {
                        sales: "Sales Inquiry",
                        support: "Technical Support",
                        other: "Other"
                    }
                },
                message: "Your Message",
                submit: "Send Message"
            },
            info: {
                title: "Let's Talk",
                subtitle: "Have questions? We're here to help!",
                email: "a.arhurpopa@gmail.com",
                phone: "0727603403",
                whatsapp: "0727603403",
                instagram: "arthur_popa"
            }
        },
        demo: {
            title: "Complete Version Features",
            subtitle: "The complete version includes:",
            barberName: "Mike the Barber",
            features: [
                "Real Google Calendar Integration",
                "Real-time Availability Check",
                "Advanced User Intent Detection",
                "Multiple Appointment Management",
                "Cancellation and Rescheduling",
                "Automatic Reminders",
                "Complete Message Customization",
                "Integration with Your Booking System",
                "Multi-language Support",
                "Reports and Analytics"
            ],
            disclaimer: "⚠️ DISCLAIMER: This is just a simple demo. The complete version uses ChatGPT and has much more advanced capabilities!"
        },
        testimonials: {
            title: "What Our Clients Say",
            cards: [
                {
                    content: "BookWise.ai has completely transformed how we handle appointments. Our clients love the ease of booking through WhatsApp!",
                    author: "John Smith",
                    position: "Barber Shop Owner"
                }
                // Add more testimonials
            ]
        }
    },
    ro: {
        pageTitle: "Automatizare Programări WhatsApp",
        chat: {
            inputPlaceholder: "Scrie un mesaj...",
            assistantName: "Mircea Frizer",
            welcome: "Bună! Scrie un mesaj pentru a începe conversația. Vorbeste natural, cum ai face si cu un om.",
            availableSlots: "Am disponibile următoarele ore",
            confirmationRequest: "Vrei să confirm programarea?",
            bookingConfirmed: "Perfect! Te aștept! 🤝",
            bookingCancelled: "Nicio problemă! Spune-mi dacă vrei să verifici alte ore disponibile.",
            features: {
                title: "Funcționalități Versiune Completă",
                subtitle: "Versiunea completă include:",
                list: [
                    "Integrare reală cu Google Calendar",
                    "Verificare disponibilitate în timp real",
                    "Detectare avansată a intențiilor utilizatorului",
                    "Gestionare programări multiple",
                    "Anulare și reprogramare",
                    "Reminder-uri automate",
                    "Personalizare completă a mesajelor",
                    "Integrare cu sistemul tău de programări",
                    "Suport pentru mai multe limbi",
                    "Rapoarte și analize"
                ]
            }
        },
        nav: {
            features: "Funcționalități",
            demo: "Demo",
            howItWorks: "Cum Funcționează",
            pricing: "Prețuri",
            testimonials: "Testimoniale",
            contact: "Contact"
        },
        hero: {
            title: "Programări WhatsApp. Planificare Inteligentă. Management Simplu.",
            subtitle: "Automatizează programările prin WhatsApp și sincronizează-le instant cu Google Calendar.",
            cta: {
                primary: "Începe Acum",
                secondary: "Află Mai Multe"
            }
        },
        features: {
            title: "Funcționalități Puternice pentru Afacerea Ta",
            cards: {
                whatsapp: {
                    title: "Integrare WhatsApp",
                    items: [
                        "Programare directă",
                        "Răspunsuri și confirmări automate",
                        "Asistent chatbot inteligent"
                    ]
                },
                calendar: {
                    title: "Sincronizare Calendar",
                    items: [
                        "Sincronizare automată programări",
                        "Detectare conflicte program",
                        "Reprogramare inteligentă"
                    ]
                }
            }
        },
        howItWorks: {
            title: "Cum Funcționează",
            steps: [
                {
                    title: "1. Începe o Conversație",
                    description: "Trimite un mesaj pe WhatsApp pentru a începe procesul de programare."
                },
                {
                    title: "2. Alege Ora",
                    description: "Asistentul nostru AI te va ajuta să găsești și să selectezi intervalul perfect pentru tine."
                },
                {
                    title: "3. Confirmare Instantă",
                    description: "Primești confirmarea imediat și programarea este adăugată în sistem."
                },
                {
                    title: "4. Primești Notificări",
                    description: "Primești notificări automate prin WhatsApp înainte de programare."
                },
                {
                    title: "5. Gestionare Ușoară",
                    description: "Anulează sau reprogramează întâlnirea cu doar câteva mesaje."
                }
            ]
        },
        pricing: {
            title: "Alege Planul Tău",
            cards: [
                {
                    title: "De Bază",
                    price: "100 lei",
                    period: "/lună",
                    features: [
                        "Până la 200 programări/lună",
                        "Integrare WhatsApp",
                        "Integrare Google Calendar",
                        "Analize de bază",
                        "Răspunsuri mai robotice, însă își face treaba",
                        "Suport prin email"
                    ],
                    cta: "Începe Acum"
                },
                {
                    title: "Profesional",
                    price: "200 lei",
                    period: "/lună",
                    features: [
                        "Până la 1000 programări/lună",
                        "Analize avansate",
                        "Integrări personalizate",
                        "AI avansat cu înțelegere naturală",
                        "Răspunsuri precum un om",
                        "Notificări personalizate opționale"
                    ],
                    cta: "Începe Acum"
                },
                {
                    title: "Enterprise",
                    price: "~500lei+",
                    period: "/lună",
                    features: [
                        "Programări nelimitate",
                        "Conturi multiple pentru personal",
                        "Suport prioritar (Email & SMS/WhatsApp)",
                        "Manager de cont dedicat",
                        "Suport telefonic 24/7"
                    ],
                    cta: "Contactează-ne"
                }
            ]
        },
        contact: {
            title: "Contactează-ne",
            subtitle: "Ai întrebări despre serviciile noastre? Suntem aici să te ajutăm!",
            info: {
                title: "Hai să Vorbim",
                subtitle: "Ai întrebări? Suntem aici să te ajutăm!",
                email: "a.arhurpopa@gmail.com",
                phone: "0727603403",
                whatsapp: "0727603403",
                instagram: "arthur_popa"
            },
            form: {
                name: "Numele Tău",
                email: "Email-ul Tău",
                topic: {
                    label: "Selectează Subiectul",
                    options: {
                        sales: "Informații Vânzări",
                        support: "Suport Tehnic",
                        other: "Altele"
                    }
                },
                message: "Mesajul Tău",
                submit: "Trimite Mesaj"
            }
        },
        footer: {
            company: "Programări inteligente pentru afaceri moderne",
            links: {
                product: {
                    title: "Produs",
                    items: {
                        features: "Funcționalități",
                        pricing: "Prețuri",
                        demo: "Demo"
                    }
                },
                company: {
                    title: "Companie",
                    items: {
                        about: "Despre Noi",
                        contact: "Contact",
                        privacy: "Politica de Confidențialitate"
                    }
                }
            },
            copyright: "© 2024 BookWise.ai. Toate drepturile rezervate."
        },
        demo: {
            title: "Funcționalități Versiune Completă",
            subtitle: "Versiunea completă include:",
            barberName: "Mircea Frizer",
            features: [
                "Integrare reală cu Google Calendar",
                "Verificare disponibilitate în timp real",
                "Detectare avansată a intențiilor utilizatorului",
                "Gestionare programări multiple",
                "Anulare și reprogramare",
                "Reminder-uri automate",
                "Personalizare completă a mesajelor",
                "Integrare cu sistemul tău de programări",
                "Suport pentru mai multe limbi",
                "Rapoarte și analize"
            ],
            disclaimer: "⚠️ DISCLAIMER: Acesta este doar un demo simplu. Versiunea completă folosește AI și are capacități mult mai avansate!"
        },
        testimonials: {
            title: "Ce Spun Clienții Noștri",
            cards: [
                {
                    content: "BookWise.ai a transformat complet modul în care gestionăm programările. Clienții noștri adoră cât de ușor este să se programeze prin WhatsApp!",
                    author: "John Smith",
                    position: "Proprietar Salon"
                }
                // Add more testimonials
            ]
        }
    }
};

let currentLang = 'en';

// Update the toggleLanguage function to handle all translatable elements
function toggleLanguage() {
    const langBtn = document.querySelector('.lang-btn');
    const newLang = currentLang === 'en' ? 'ro' : 'en';
    
    // Fade to semi-dark
    document.body.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    document.body.style.opacity = '0.7';
    document.body.style.filter = 'brightness(0.7)';
    
    setTimeout(() => {
        currentLang = newLang;
        langBtn.classList.toggle('ro');
        
        // Update all content
        updateAllContent();
        
        // Fade back in
        document.body.style.opacity = '1';
        document.body.style.filter = 'brightness(1)';
    }, 300);
}

// Funcție îmbunătățită pentru actualizarea conținutului
function updateAllContent() {
    // Actualizare titlu pagină
    document.title = translations[currentLang].pageTitle;
    
    // Actualizare placeholder-uri chat
    const userInput = document.querySelector('#user-input');
    if (userInput) {
        userInput.placeholder = translations[currentLang].chat.inputPlaceholder;
    }
    
    const assistantName = document.querySelector('.business-profile span');
    if (assistantName) {
        assistantName.textContent = translations[currentLang].chat.assistantName;
    }
    
    // Actualizare toate elementele cu data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const keys = element.getAttribute('data-lang-key').split('.');
        let translation = translations[currentLang];
        
        try {
            keys.forEach(key => {
                translation = translation[key];
            });
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        } catch (error) {
            console.warn(`Translation missing for key: ${keys.join('.')}`);
        }
    });
}

// Adăugăm un mesaj inițial când se încarcă pagina
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages && chatMessages.children.length === 0) {
        // Clear any existing messages
        chatMessages.innerHTML = '';
        // Add initial message
        addMessage(translations[currentLang].chat.welcome, false);
    }
});

// Adăugăm animații la scroll
document.addEventListener('DOMContentLoaded', () => {
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    
    const elementInView = (el, percentageScroll = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
        );
    };
    
    const displayScrollElement = (element) => {
        element.classList.add('active');
    };
    
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 90)) {
                displayScrollElement(el);
            }
        });
    };
    
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });
    
    // Trigger inițial
    handleScrollAnimation();
});

// Animații la scroll
function handleScrollAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => observer.observe(card));
}

document.addEventListener('DOMContentLoaded', handleScrollAnimations);

// Adăugăm traducerea pentru noul pas
translations.en.howItWorks.steps.push({
    title: "5. Easy Management",
    description: "Cancel or reschedule your appointment with just a few messages."
});

translations.ro.howItWorks.steps.push({
    title: "5. Gestionare Ușoară",
    description: "Anulează sau reprogramează întâlnirea cu doar câteva mesaje."
});

translations.ro.features = {
    title: "Funcționalități Puternice pentru Afacerea Ta",
    cards: {
        whatsapp: {
            title: "Integrare WhatsApp",
            items: [
                "Programare directă",
                "Răspunsuri și confirmări automate",
                "Asistent chatbot inteligent"
            ]
        },
        calendar: {
            title: "Sincronizare Calendar",
            items: [
                "Sincronizare automată programări",
                "Detectare conflicte program",
                "Reprogramare inteligentă"
            ]
        }
    }
};

// Actualizăm mesajul de bun venit de la Mircea
translations.ro.chat.welcome = "Bună! Scrie un mesaj pentru a începe conversația. Te pot ajuta cu o programare - spune-mi doar când ai dori să vii.";

// Add button handlers
document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.querySelector('.cta-primary');
    const learnMoreBtn = document.querySelector('.cta-secondary');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // Create and show the arrow
            const arrow = document.createElement('div');
            arrow.className = 'pointing-arrow';
            arrow.innerHTML = '<i class="fas fa-arrow-down"></i>';
            document.body.appendChild(arrow);
            
            // Position the arrow below the button
            const buttonRect = getStartedBtn.getBoundingClientRect();
            arrow.style.top = `${buttonRect.bottom + 20}px`;
            
            // Scroll to contact section
            document.querySelector('#contact').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Remove the arrow after animation
            setTimeout(() => {
                arrow.remove();
            }, 2000);
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            // Scroll to features section
            document.querySelector('#features').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
});
