// Simulare conversație demo bazată pe botv2.js
const botMessages = {
    en: {
        greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        bookingPhrases: [
            'i want to make an appointment',
            'i would like an appointment',
            'can i make an appointment',
            'i want to book',
            'i would like to book',
            'make an appointment',
            'appointment',
            'booking',
            'can i come',
            'can i schedule'
        ],
        days: {
            'monday': ['monday'],
            'tuesday': ['tuesday'],
            'wednesday': ['wednesday'],
            'thursday': ['thursday'],
            'friday': ['friday'],
            'saturday': ['saturday'],
            'tomorrow': ['tomorrow'],
            'day after tomorrow': ['day after tomorrow']
        },
        responses: {
            greeting: "Hi! 👋 How can I help you?",
            timePreference: `For {day} the first available slot is at {time}. Does this time work for you or would you prefer another time? My schedule is between 10:00 and 20:00.`,
            confirmAppointment: `Perfect! I can schedule you for {day} at {time}. Do you confirm? 👍`,
            timeOccupied: `The {time} slot is taken, but I have an opening at {nextSlot}. Would that work? 🤔`,
            noAvailability: `I'm sorry, I don't have any more available slots for {day} after {time}. Would you like to check another day?`,
            confirmed: "Perfect! You're all set! 🤝 See you then!",
            askPreference: "Ok, I understand. What time would you prefer to come?",
            askNewDay: "I'm sorry to hear that. Would you like to schedule for another day?",
            askTime: "What time would you like to come? I'm available between 10:00 and 20:00",
            askDay: "What day would you like to come for a haircut?"
        }
    },
    ro: {
        greetings: ['salut', 'buna', 'hey', 'hi', 'bună', 'ceau', 'servus', 'neata', 'ziua', 'sal'],
        bookingPhrases: [
            'vreau sa ma programez',
            'as vrea o programare',
            'ma pot programa',
            'vreau si eu',
            'as vrea si eu',
            'fac o programare',
            'programare',
            'rezervare',
            'pot sa vin',
            'pot sa ma programez'
        ],
        days: {
            'luni': ['luni', 'lunea'],
            'marți': ['marti', 'martea', 'marți', 'marțea'],
            'miercuri': ['miercuri', 'miercurea'],
            'joi': ['joi', 'joia'],
            'vineri': ['vineri', 'vinerea'],
            'sâmbătă': ['sambata', 'sâmbătă', 'sambăta', 'sâmbăta'],
            'mâine': ['maine', 'mâine'],
            'poimâine': ['poimaine', 'poimâine']
        },
        responses: {
            greeting: "Salut! 👋 Cu ce te pot ajuta?",
            timePreference: `Pentru {day} primul loc liber e la {time}. Îți convine ora asta sau preferi altă oră? Programul meu e între 10:00 și 20:00.`,
            confirmAppointment: `Perfect! Te pot programa {day} la ora {time}. Confirmi? 👍`,
            timeOccupied: `La {time} e ocupat, dar am liber la {nextSlot}. Merge ora asta? 🤔`,
            noAvailability: `Îmi pare rău, nu mai am locuri disponibile {day} după ora {time}. Vrei să verific altă zi?`,
            confirmed: "Perfect! Te-am programat! 🤝 Te aștept!",
            askPreference: "Ok, înțeleg. La ce oră ai prefera să vii?",
            askNewDay: "Îmi pare rău să aud asta. Vrei să te programezi pentru altă zi?",
            askTime: "La ce oră ai vrea să vii? Sunt disponibil între 10:00 și 20:00",
            askDay: "În ce zi ai vrea să vii la un tuns?"
        }
    }
};

const demoBot = {
    conversations: {},
    businessHours: {
        start: 10,
        end: 20
    },
    
    // Simulăm un calendar fix cu câteva programări
    mockCalendar: {
        '2024-02-19': ['10:00', '14:30'],
        '2024-02-20': ['11:00', '15:00', '16:20'],
        '2024-02-21': ['12:00', '13:00'],
        '2024-02-22': ['10:00', '11:20', '14:00'],
        '2024-02-23': ['16:00', '17:20', '18:00']
    },

    async processMessage(message, chatId = 'demo') {
        const lang = currentLang; // Folosim variabila globală currentLang
        
        if (!this.conversations[chatId]) {
            this.conversations[chatId] = {
                state: 'INITIAL',
                messages: [],
                exactDate: null,
                requestedDay: null,
                requestedTime: null,
                lastQuestion: null
            };
        }
        
        const conv = this.conversations[chatId];
        conv.messages.push(message.toLowerCase());

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificăm mai întâi dacă suntem în starea de așteptare confirmare
        if (conv.state === 'WAITING_FOR_CONFIRMATION') {
            if (this.isConfirmation(message, lang)) {
                conv.state = 'CONFIRMED';
                return botMessages[lang].responses.confirmed;
            } else if (this.isDenial(message, lang)) {
                conv.state = 'INITIAL';
                conv.lastQuestion = 'ask_preference';
                return botMessages[lang].responses.askPreference;
            }
        }

        if (this.isGreeting(message, lang)) {
            conv.lastQuestion = 'greeting';
            return botMessages[lang].responses.greeting;
        }

        const detectedDay = this.detectDay(message, lang);
        if (detectedDay) {
            conv.requestedDay = detectedDay;
            conv.exactDate = this.getDayDate(detectedDay);
            const availableSlots = this.getAvailableSlots(detectedDay);
            
            const detectedTime = this.detectTime(message);
            if (detectedTime) {
                return this.processTimeRequest(detectedTime, conv, lang);
            }

            if (availableSlots.length > 0) {
                conv.lastQuestion = 'time_preference';
                return botMessages[lang].responses.timePreference
                    .replace('{day}', detectedDay)
                    .replace('{time}', availableSlots[0]);
            }
        }

        if (conv.requestedDay) {
            const detectedTime = this.detectTime(message);
            if (detectedTime) {
                return this.processTimeRequest(detectedTime, conv, lang);
            }
        }

        if (this.isCancellation(message, lang)) {
            conv.state = 'INITIAL';
            conv.lastQuestion = 'ask_new_day';
            return botMessages[lang].responses.askNewDay;
        }

        if (conv.requestedDay && !conv.requestedTime) {
            conv.lastQuestion = 'ask_time';
            return botMessages[lang].responses.askTime;
        }

        conv.lastQuestion = 'ask_day';
        return botMessages[lang].responses.askDay;
    },

    isGreeting(message, lang) {
        return botMessages[lang].greetings.some(greeting => 
            message.toLowerCase().includes(greeting));
    },

    isBookingIntent(message, lang) {
        return botMessages[lang].bookingPhrases.some(phrase => 
            message.toLowerCase().includes(phrase));
    },

    detectDay(message, lang) {
        const msg = message.toLowerCase();
        const days = botMessages[lang].days;
        
        for (const [day, variants] of Object.entries(days)) {
            if (variants.some(variant => msg.includes(variant))) {
                return day;
            }
        }
        return null;
    },

    detectTime(message) {
        // Detectăm formate comune de oră
        const timePatterns = [
            /(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // 4:30, 16:30
            /la\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // la 4:30
            /de\s+la\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // de la 4:30
            /pe\s+la\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // pe la 4:30
            /de\s+pe\s+la\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // de pe la 4:30  
            /ora\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i,  // ora 4:30
            /(\d{1,2})(?::(\d{2}))?\s*(seara|dimineata|dimineață|după-masă|dupa-masa|dupa amiaza)/i  // 7 seara, 8 dimineata
        ];

        const msg = message.toLowerCase();
        const isPM = msg.includes('seara') || msg.includes('după-masă') || msg.includes('dupa-masa') || msg.includes('dupa amiaza');
        const isAM = msg.includes('dimineata') || msg.includes('dimineață');

        for (const pattern of timePatterns) {
            const match = message.match(pattern);
            if (match) {
                let hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;
                
                // Convertim la format 24h dacă e necesar
                if (match[3]?.toLowerCase() === 'pm' || 
                    match[3]?.toLowerCase() === 'seara' || 
                    match[3]?.toLowerCase() === 'după-masă' || 
                    match[3]?.toLowerCase() === 'dupa-masa' || 
                    isPM || 
                    (!isAM && hours <= 9)) {
                    hours = hours === 12 ? 12 : hours + 12;
                }
                
                // Validăm ora
                if (hours >= this.businessHours.start && hours < this.businessHours.end) {
                    return `${hours}:${minutes.toString().padStart(2, '0')}`;
                }
            }
        }

        // Verificăm și pentru expresii simple de timp
        if (msg.match(/^(\d{1,2})$/)) {
            let hours = parseInt(msg);
            if (hours <= 9) {
                hours += 12; // Asumăm PM pentru ore mici
            }
            if (hours >= this.businessHours.start && hours < this.businessHours.end) {
                return `${hours}:00`;
            }
        }

        return null;
    },

    getAvailableSlots(day) {
        // Simulăm sloturi disponibile pentru ziua respectivă
        const date = this.getDayDate(day);
        const bookedSlots = this.mockCalendar[date] || [];
        const allSlots = [];
        
        for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
            for (let minute = 0; minute < 60; minute += 20) {
                const timeSlot = `${hour}:${minute.toString().padStart(2, '0')}`;
                if (!bookedSlots.includes(timeSlot)) {
                    allSlots.push(timeSlot);
                }
            }
        }
        
        return allSlots;
    },

    isTimeAvailable(day, time) {
        const date = this.getDayDate(day);
        const bookedSlots = this.mockCalendar[date] || [];
        return !bookedSlots.includes(time);
    },

    findNextAvailableSlot(day, afterTime) {
        const slots = this.getAvailableSlots(day);
        return slots.find(slot => slot > afterTime) || null;
    },

    getDayDate(day) {
        // Convertim ziua în dată
        const today = new Date();
        const dayMap = {
            'luni': 1, 'marți': 2, 'miercuri': 3,
            'joi': 4, 'vineri': 5, 'sâmbătă': 6
        };

        if (day === 'mâine') {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        if (day === 'poimâine') {
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(today.getDate() + 2);
            return dayAfterTomorrow.toISOString().split('T')[0];
        }

        const targetDay = dayMap[day];
        if (targetDay !== undefined) {
            const date = new Date(today);
            while (date.getDay() !== targetDay) {
                date.setDate(date.getDate() + 1);
            }
            return date.toISOString().split('T')[0];
        }

        return today.toISOString().split('T')[0];
    },

    isConfirmation(message, lang) {
        const confirmations = {
            en: ['yes', 'ok', 'sure', 'good', 'confirm', 'perfect', 'definitely', 'agree', 'yep', 'yeah', 'alr', 'alright', 'okay', 'of course', 'ofc'],
            ro: ['da', 'ok', 'bine', 'merge', 'sigur', 'confirm', 'perfect', 'desigur', 'de acord']
        };
        return confirmations[lang].some(word => message.toLowerCase().includes(word));
    },

    isDenial(message, lang) {
        const denials = ['nu', 'nah', 'nope', 'nu merge'];
        return denials.some(word => message.toLowerCase().includes(word));
    },

    isCancellation(message, lang) {
        const cancellations = ['anulez', 'modific', 'schimb', 'nu mai pot', 'reprogram'];
        return cancellations.some(word => message.toLowerCase().includes(word));
    },

    // Adăugăm funcție pentru analiza completă a mesajului
    async analyzeMessage(message) {
        return {
            hasDay: this.detectDay(message),
            hasTime: this.detectTime(message),
            hasPreference: message.includes('prefer') || message.includes('vreau') || message.includes('după') || message.includes('inainte de'),
            timePreference: message.includes('dimineață') ? 'morning' : message.includes('seară') ? 'evening' : null
        };
    },

    processTimeRequest(time, conv, lang) {
        if (this.isTimeAvailable(conv.requestedDay, time)) {
            conv.requestedTime = time;
            conv.state = 'WAITING_FOR_CONFIRMATION';
            return botMessages[lang].responses.confirmAppointment
                .replace('{day}', conv.requestedDay)
                .replace('{time}', time);
        } else {
            const nextAvailable = this.findNextAvailableSlot(conv.requestedDay, time);
            if (nextAvailable) {
                return botMessages[lang].responses.timeOccupied
                    .replace('{time}', time)
                    .replace('{nextSlot}', nextAvailable);
            } else {
                return botMessages[lang].responses.noAvailability
                    .replace('{day}', conv.requestedDay)
                    .replace('{time}', time);
            }
        }
    },

    processFullRequest(messageIntent) {
        // Implementarea procesării complete a cererii
        // Aceasta ar putea implica verificarea disponibilității zilei și orii,
        // și returnarea unui răspuns corespunzător
        return "Răspuns la cerere completă";
    }
};

// Actualizăm funcția sendMessage din interfața demo
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Adăugăm mesajul utilizatorului
    addMessage(message, true);
    userInput.value = '';
    
    // Procesăm mesajul și primim răspunsul botului
    const response = await demoBot.processMessage(message);
    addMessage(response, false);
} 