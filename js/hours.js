/**
 * PHARMACIE NATURABIO - Hours JavaScript
 * Opening Hours Management & Alerts
 */

(function() {
    'use strict';

    // ===== Configuration =====
    const HOURS = {
        monday: { open: '14:00', close: '19:00', label: 'Lundi' },
        tuesday: { open: '09:00', close: '19:00', label: 'Mardi' },
        wednesday: { open: '09:00', close: '19:00', label: 'Mercredi' },
        thursday: { open: '09:00', close: '19:00', label: 'Jeudi' },
        friday: { open: '09:00', close: '19:00', label: 'Vendredi' },
        saturday: { open: '09:00', close: '17:00', label: 'Samedi' },
        sunday: { open: null, close: null, label: 'Dimanche' }
    };

    // Special closures or modified hours
    const SPECIAL_HOURS = [
        // { date: '2024-12-25', closed: true, message: 'Fermé pour Noël' },
        // { date: '2024-01-01', closed: true, message: 'Fermé pour le Nouvel An' },
        // { date: '2024-12-24', open: '09:00', close: '17:00', message: 'Horaires réduits' }
    ];

    // Alerts to display
    const ALERTS = [
        // { start: '2024-01-15', end: '2024-01-20', message: 'Fermeture exceptionnelle pour inventaire du 15 au 20 janvier' },
        // { start: '2024-02-01', end: '2024-02-28', message: 'Soldes d\'hiver : -20% sur une sélection de produits' }
    ];

    // Day mapping
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // ===== Get Current Status =====
    function getCurrentStatus() {
        const now = new Date();
        const currentDay = DAYS[now.getDay()];
        const currentTime = formatTime(now.getHours(), now.getMinutes());
        const todayDate = formatDate(now);

        // Check for special hours
        const specialDay = SPECIAL_HOURS.find(s => s.date === todayDate);
        if (specialDay) {
            if (specialDay.closed) {
                return {
                    isOpen: false,
                    message: specialDay.message || 'Fermé aujourd\'hui',
                    nextOpen: getNextOpenTime(now)
                };
            }
            // Modified hours
            const isOpen = isTimeBetween(currentTime, specialDay.open, specialDay.close);
            return {
                isOpen,
                message: specialDay.message,
                hours: { open: specialDay.open, close: specialDay.close },
                nextOpen: isOpen ? null : getNextOpenTime(now)
            };
        }

        // Regular hours
        const dayHours = HOURS[currentDay];
        if (!dayHours.open) {
            return {
                isOpen: false,
                message: 'Fermé le dimanche',
                nextOpen: getNextOpenTime(now)
            };
        }

        const isOpen = isTimeBetween(currentTime, dayHours.open, dayHours.close);

        if (isOpen) {
            const closingIn = getMinutesUntil(currentTime, dayHours.close);
            let message = '';
            if (closingIn <= 30) {
                message = `Fermeture dans ${closingIn} minutes`;
            }
            return {
                isOpen: true,
                message,
                hours: dayHours,
                closingIn
            };
        }

        return {
            isOpen: false,
            message: currentTime < dayHours.open ? 'Ouverture prochaine' : 'Fermé',
            hours: dayHours,
            nextOpen: getNextOpenTime(now)
        };
    }

    // ===== Get Next Open Time =====
    function getNextOpenTime(from) {
        const current = new Date(from);

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(current);
            checkDate.setDate(checkDate.getDate() + i);
            const dayName = DAYS[checkDate.getDay()];
            const dayHours = HOURS[dayName];

            // Check for special closure
            const dateStr = formatDate(checkDate);
            const specialDay = SPECIAL_HOURS.find(s => s.date === dateStr);

            if (specialDay) {
                if (specialDay.closed) continue;
                if (i === 0 && formatTime(current.getHours(), current.getMinutes()) >= specialDay.close) continue;
                return {
                    day: dayHours.label,
                    time: specialDay.open,
                    date: dateStr,
                    isToday: i === 0
                };
            }

            if (!dayHours.open) continue;

            // Same day, check if still time to open
            if (i === 0) {
                const currentTime = formatTime(current.getHours(), current.getMinutes());
                if (currentTime < dayHours.open) {
                    return {
                        day: dayHours.label,
                        time: dayHours.open,
                        date: dateStr,
                        isToday: true
                    };
                }
                continue;
            }

            return {
                day: dayHours.label,
                time: dayHours.open,
                date: dateStr,
                isToday: false
            };
        }

        return null;
    }

    // ===== Get Active Alerts =====
    function getActiveAlerts() {
        const today = formatDate(new Date());
        return ALERTS.filter(alert => {
            return today >= alert.start && today <= alert.end;
        });
    }

    // ===== Render Hours Status =====
    function renderHoursStatus() {
        const statusContainer = document.querySelector('.hours-status');
        if (!statusContainer) return;

        const status = getCurrentStatus();

        const badgeClass = status.isOpen ? 'badge-open' : 'badge-closed';
        const badgeText = status.isOpen ? 'Ouvert' : 'Fermé';

        let statusHTML = `<span class="badge ${badgeClass}">${badgeText}</span>`;

        if (status.message) {
            statusHTML += `<span class="hours-message">${status.message}</span>`;
        } else if (status.isOpen && status.hours) {
            statusHTML += `<span class="hours-message">Jusqu'à ${status.hours.close}</span>`;
        } else if (!status.isOpen && status.nextOpen) {
            if (status.nextOpen.isToday) {
                statusHTML += `<span class="hours-message">Ouvre à ${status.nextOpen.time}</span>`;
            } else {
                statusHTML += `<span class="hours-message">Ouvre ${status.nextOpen.day} à ${status.nextOpen.time}</span>`;
            }
        }

        statusContainer.innerHTML = statusHTML;
    }

    // ===== Render Hours Table =====
    function renderHoursTable() {
        const tableContainer = document.querySelector('.hours-table');
        if (!tableContainer) return;

        const today = DAYS[new Date().getDay()];

        const tableHTML = Object.entries(HOURS).map(([day, hours]) => {
            const isToday = day === today;
            const timeStr = hours.open
                ? `${hours.open} - ${hours.close}`
                : 'Fermé';

            return `
                <tr class="${isToday ? 'today' : ''}">
                    <td class="day">${hours.label}</td>
                    <td class="time">${timeStr}</td>
                </tr>
            `;
        }).join('');

        tableContainer.innerHTML = tableHTML;
    }

    // ===== Render Alerts =====
    function renderAlerts() {
        const alertContainer = document.querySelector('.hours-alert');
        if (!alertContainer) return;

        const activeAlerts = getActiveAlerts();

        if (activeAlerts.length > 0) {
            alertContainer.innerHTML = activeAlerts.map(alert =>
                `<p>${alert.message}</p>`
            ).join('');
            alertContainer.classList.add('active');
        } else {
            alertContainer.classList.remove('active');
        }
    }

    // ===== Render Footer Hours =====
    function renderFooterHours() {
        const footerHours = document.querySelector('.footer-hours');
        if (!footerHours) return;

        footerHours.innerHTML = `
            <p><strong>Lundi :</strong> 14h - 19h</p>
            <p><strong>Mardi - Vendredi :</strong> 9h - 19h</p>
            <p><strong>Samedi :</strong> 9h - 17h</p>
        `;
    }

    // ===== Utility Functions =====
    function formatTime(hours, minutes) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function isTimeBetween(time, start, end) {
        const timeMin = timeToMinutes(time);
        const startMin = timeToMinutes(start);
        const endMin = timeToMinutes(end);
        return timeMin >= startMin && timeMin < endMin;
    }

    function getMinutesUntil(from, to) {
        return timeToMinutes(to) - timeToMinutes(from);
    }

    // ===== Initialize =====
    function init() {
        renderHoursStatus();
        renderHoursTable();
        renderAlerts();
        renderFooterHours();

        // Update status every minute
        setInterval(renderHoursStatus, 60000);
    }

    // ===== Public API =====
    window.NaturabioHours = {
        getCurrentStatus,
        getActiveAlerts,
        getNextOpenTime: () => getNextOpenTime(new Date()),
        isOpen: () => getCurrentStatus().isOpen,

        // Admin functions to update hours/alerts
        setSpecialHours: (date, hours) => {
            const existing = SPECIAL_HOURS.findIndex(s => s.date === date);
            if (existing > -1) {
                SPECIAL_HOURS[existing] = { date, ...hours };
            } else {
                SPECIAL_HOURS.push({ date, ...hours });
            }
            renderHoursStatus();
            renderAlerts();
        },

        addAlert: (alert) => {
            ALERTS.push(alert);
            renderAlerts();
        },

        removeAlert: (index) => {
            ALERTS.splice(index, 1);
            renderAlerts();
        }
    };

    // ===== Run on DOM Ready =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
