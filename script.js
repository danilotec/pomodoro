        // Estado da aplicação
        const state = {
            mode: 'focus',
            timeLeft: 25 * 60,
            isRunning: false,
            completedPomodoros: 0,
            intervalId: null
        };

        // Configurações dos modos
        const modes = {
            focus: { duration: 25 * 60, label: 'Foco' },
            shortBreak: { duration: 5 * 60, label: 'Pausa Curta' },
            longBreak: { duration: 15 * 60, label: 'Pausa Longa' }
        };

        // Elementos do DOM
        const elements = {
            body: document.body,
            timerDisplay: document.getElementById('timerDisplay'),
            modeLabel: document.getElementById('modeLabel'),
            pomodorosCount: document.getElementById('pomodorosCount'),
            toggleBtn: document.getElementById('toggleBtn'),
            toggleText: document.getElementById('toggleText'),
            playPauseIcon: document.getElementById('playPauseIcon'),
            resetBtn: document.getElementById('resetBtn'),
            progressCircle: document.getElementById('progressCircle'),
            modeButtons: document.querySelectorAll('.mode-btn'),
            dots: document.querySelectorAll('.dot')
        };

        // Inicializar círculo de progresso
        const radius = 130;
        const circumference = 2 * Math.PI * radius;
        elements.progressCircle.style.strokeDasharray = circumference;
        elements.progressCircle.style.strokeDashoffset = circumference;

        // Formatar tempo
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        // Atualizar display
        function updateDisplay() {
            elements.timerDisplay.textContent = formatTime(state.timeLeft);
            elements.modeLabel.textContent = modes[state.mode].label;
            elements.pomodorosCount.textContent = state.completedPomodoros;
            
            // Atualizar círculo de progresso
            const progress = (modes[state.mode].duration - state.timeLeft) / modes[state.mode].duration;
            const offset = circumference - (progress * circumference);
            elements.progressCircle.style.strokeDashoffset = offset;

            // Atualizar dots de progresso
            elements.dots.forEach((dot, index) => {
                if (index < state.completedPomodoros % 4) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Alternar timer
        function toggleTimer() {
            if (!state.isRunning) {
                // Iniciar
                state.isRunning = true;
                elements.toggleText.textContent = 'Pausar';
                elements.playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                
                // Solicitar permissão de notificação
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }

                state.intervalId = setInterval(() => {
                    state.timeLeft--;
                    updateDisplay();

                    if (state.timeLeft === 0) {
                        handleTimerComplete();
                    }
                }, 1000);
            } else {
                // Pausar
                state.isRunning = false;
                elements.toggleText.textContent = 'Iniciar';
                elements.playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                clearInterval(state.intervalId);
            }
        }

        // Timer completo
        function handleTimerComplete() {
            clearInterval(state.intervalId);
            state.isRunning = false;

            if (state.mode === 'focus') {
                state.completedPomodoros++;
                
                if (state.completedPomodoros % 4 === 0) {
                    switchMode('longBreak');
                } else {
                    switchMode('shortBreak');
                }
            } else {
                switchMode('focus');
            }

            // Notificação
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: state.mode === 'focus' ? 'Hora de fazer uma pausa!' : 'Hora de focar!',
                    icon: '🍅'
                });
            }

            updateDisplay();
        }

        // Mudar modo
        function switchMode(newMode) {
            state.mode = newMode;
            state.timeLeft = modes[newMode].duration;
            state.isRunning = false;
            
            elements.body.className = newMode;
            elements.toggleText.textContent = 'Iniciar';
            elements.playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            
            if (state.intervalId) {
                clearInterval(state.intervalId);
            }

            // Atualizar botões de modo
            elements.modeButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === newMode) {
                    btn.classList.add('active');
                }
            });

            updateDisplay();
        }

        // Resetar timer
        function resetTimer() {
            state.timeLeft = modes[state.mode].duration;
            state.isRunning = false;
            elements.toggleText.textContent = 'Iniciar';
            elements.playPauseIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            
            if (state.intervalId) {
                clearInterval(state.intervalId);
            }
            
            updateDisplay();
        }

        // Event Listeners
        elements.toggleBtn.addEventListener('click', toggleTimer);
        elements.resetBtn.addEventListener('click', resetTimer);

        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                switchMode(btn.dataset.mode);
            });
        });

        // Inicializar
        updateDisplay();