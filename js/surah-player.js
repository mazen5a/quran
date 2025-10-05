// Shared surah player script used by all reciter pages - Enhanced Version
// Each page must define a global `RECITER` object before including this script, e.g:
// <script>window.RECITER = { name: 'الشيخ ...', base: 'https://server/path/' };</script>

(function () {
    'use strict';

    // Enhanced configuration loader with better error handling
    function getReciterConfig() {
        if (window.RECITER && window.RECITER.base) return window.RECITER;
        
        try {
            const body = document.body;
            if (body) {
                const name = body.dataset?.reciterName || body.getAttribute('data-reciter-name') || '';
                const base = body.dataset?.reciterBase || body.getAttribute('data-reciter-base');
                if (base) return { name, base };
            }
        } catch (e) {
            console.warn('Error reading data attributes:', e);
        }
        
        return null;
    }

    const RECITER = getReciterConfig();
    if (!RECITER?.base) {
        console.error('RECITER config missing. Set window.RECITER or <body data-reciter-base="https://.../" data-reciter-name="...">');
        return;
    }

    const surahNames = [
        "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الإنفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
    ];

    // Enhanced surahs array with additional properties
    const surahs = surahNames.map((name, i) => ({
        name: name,
        file: RECITER.base + String(i + 1).padStart(3, '0') + '.mp3',
        number: i + 1,
        displayName: `${i + 1}. ${name}`
    }));

    // Cache DOM elements for better performance
    const elements = {
        surahList: document.getElementById('surah-list'),
        surahTableBody: document.getElementById('surah-table-body'),
        mainAudio: null, // Will be created for floating player
        audioSource: null, // Will be created for floating player
        toggleBtn: document.getElementById('toggleSideBtn'),
        sideMenu: document.getElementById('side-menu')
    };

    let current = 0;
    let isPlaying = false;
    let isRepeat = false;
    let seekStepMinutes = 1; // default seek step in minutes for small controls

    // Create floating audio player
    function createFloatingPlayer() {
        // Create audio element for floating player
        elements.mainAudio = document.createElement('audio');
        elements.mainAudio.id = 'floating-main-audio';
        elements.audioSource = document.createElement('source');
        elements.audioSource.id = 'floating-audio-source';
        elements.mainAudio.appendChild(elements.audioSource);
        document.body.appendChild(elements.mainAudio);

        const floatingPlayer = document.createElement('div');
        floatingPlayer.id = 'floating-audio-player';
        floatingPlayer.innerHTML = `
            <div class="floating-player-container">
                <div class="player-top">
                    <div class="player-info">
                        <span id="floating-current-surah">سورة الفاتحة</span>
                    </div>
                    <div class="player-actions">
                        <button id="floating-seek-minus-btn" class="control-btn small seek-btn" title="تقديم -1 دقيقة" aria-label="تقديم -1 دقيقة">-1m</button>
                        <button id="floating-seek-plus-btn" class="control-btn small seek-btn" title="تقديم +1 دقيقة" aria-label="تقديم +1 دقيقة">+1m</button>
                        <button id="floating-repeat-btn" class="control-btn small" title="تكرار السورة" aria-pressed="false" aria-label="تبديل تكرار السورة">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" id="repeat-icon">
                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                            </svg>
                        </button>
                        <button id="floating-minimize-btn" class="control-btn small" title="تصغير المشغل" aria-label="تصغير المشغل">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h12v2H6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="player-controls">
                    <button id="floating-prev-btn" class="control-btn" aria-label="السورة السابقة">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>
                    <button id="floating-play-btn" class="control-btn play-pause-btn" aria-label="تشغيل">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" id="floating-play-icon">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" id="floating-pause-icon" style="display: none;">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    </button>
                    <button id="floating-next-btn" class="control-btn" aria-label="السورة التالية">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" id="floating-progress-bar" role="slider" aria-label="شريط التقدم" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div class="progress-fill" id="floating-progress-fill"></div>
                        <div class="progress-handle" id="floating-progress-handle" aria-hidden="true"></div>
                    </div>
                    <div class="time-display"><span id="floating-time">00:00 / 00:00</span></div>
                </div>
            </div>
        `;

        // Add styles for floating player
        const styles = `
            #floating-audio-player {
                position: fixed;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 10px 16px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                z-index: 10000;
                min-width: 260px;
                transition: all 0.22s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 13px;
            }

            #floating-audio-player:hover {
                transform: translateX(-50%) translateY(-5px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }

            .floating-player-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
            }

            .player-info {
                color: white;
                font-weight: 600;
                font-size: 14px;
                text-align: center;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .player-top {
                display:flex;
                justify-content:space-between;
                align-items:center;
                width:100%;
            }

            .player-actions {
                display:flex;
                gap:8px;
                align-items:center;
            }

            .player-controls {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .control-btn {
                background: rgba(255, 255, 255, 0.18);
                border: none;
                border-radius: 10px;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.18s ease;
                color: white;
                backdrop-filter: blur(8px);
            }

            .control-btn.small {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: rgba(255,255,255,0.1);
                font-size: 12px;
            }

            .control-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .control-btn:active {
                transform: scale(0.95);
            }

            .play-pause-btn {
                background: rgba(255, 255, 255, 0.28);
                width: 52px;
                height: 52px;
            }

            .play-pause-btn:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            .progress-container {
                width: 100%;
                max-width: 220px;
            }

            .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.18);
                border-radius: 2px;
                overflow: hidden;
                position: relative;
                cursor: pointer;
            }

            .progress-fill {
                height: 100%;
                background: white;
                border-radius: 2px;
                width: 0%;
                transition: width 0.1s ease;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }

            .progress-handle {
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: white;
                box-shadow: 0 1px 5px rgba(0,0,0,0.25);
                left: 0%;
                pointer-events: none; /* pointer handled at container */
            }

            .time-display {
                color: rgba(255,255,255,0.95);
                font-size: 12px;
                margin-top: 6px;
                text-align: center;
                font-weight: 600;
            }

            #floating-audio-player.collapsed {
                padding: 8px 12px;
                border-radius: 12px;
                min-width: 120px;
            }

            #floating-audio-player.collapsed .player-info,
            #floating-audio-player.collapsed .progress-container {
                display: none;
            }

            #floating-audio-player.collapsed .control-btn {
                width: 40px;
                height: 40px;
            }

            #floating-main-audio {
                display: none;
            }

            @media (max-width: 768px) {
                #floating-audio-player {
                    bottom: 8px;
                    left: 8px;
                    right: 8px;
                    transform: none;
                    min-width: auto;
                    border-radius: 16px;
                    padding: 8px 10px;
                }

                .control-btn { width: 36px; height: 36px; }
                .play-pause-btn { width: 46px; height: 46px; }
                .control-btn.small { width: 28px; height: 28px; }
                .progress-container { max-width: none; }

                #floating-audio-player:hover { transform: none; }
                /* Make sure collapsed state actually reduces size on small screens */
                #floating-audio-player.collapsed {
                    min-width: 64px; /* much smaller on mobile */
                    padding: 6px 8px;
                    border-radius: 12px;
                }

                #floating-audio-player.collapsed .player-info,
                #floating-audio-player.collapsed .progress-container {
                    display: none;
                }

                #floating-audio-player.collapsed .control-btn {
                    width: 34px;
                    height: 34px;
                }

                #floating-audio-player.collapsed .play-pause-btn {
                    width: 40px;
                    height: 40px;
                }
            }

            @media (max-width: 480px) {
                #floating-audio-player { bottom: 6px; padding: 6px 8px; }
                .player-info { font-size: 12px; }
                .control-btn { width: 34px; height: 34px; }
                .play-pause-btn { width: 44px; height: 44px; }
                .progress-container { max-width: none; }
                /* Collapsed tweaks for very small screens */
                #floating-audio-player.collapsed {
                    min-width: 56px;
                    padding: 4px 6px;
                }

                #floating-audio-player.collapsed .player-info,
                #floating-audio-player.collapsed .progress-container {
                    display: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(floatingPlayer);

        // Cache floating player elements
    elements.floatingPlayer = floatingPlayer;
    elements.floatingCurrentSurah = document.getElementById('floating-current-surah');
    elements.floatingPlayBtn = document.getElementById('floating-play-btn');
    elements.floatingPrevBtn = document.getElementById('floating-prev-btn');
    elements.floatingNextBtn = document.getElementById('floating-next-btn');
    elements.floatingProgressFill = document.getElementById('floating-progress-fill');
    elements.floatingPlayIcon = document.getElementById('floating-play-icon');
    elements.floatingPauseIcon = document.getElementById('floating-pause-icon');
        elements.floatingRepeatBtn = document.getElementById('floating-repeat-btn');
        elements.floatingMinimizeBtn = document.getElementById('floating-minimize-btn');
        elements.floatingSeekMinusBtn = document.getElementById('floating-seek-minus-btn');
        elements.floatingSeekPlusBtn = document.getElementById('floating-seek-plus-btn');

        // initialize accessibility attributes for minimize button
        if (elements.floatingMinimizeBtn) {
            elements.floatingMinimizeBtn.setAttribute('role', 'button');
            elements.floatingMinimizeBtn.setAttribute('aria-pressed', 'false');
        }

        // restore persisted collapsed state
        try {
            if (localStorage.getItem('floatingPlayerCollapsed') === '1') {
                elements.floatingPlayer.classList.add('collapsed');
                if (elements.floatingMinimizeBtn) {
                    elements.floatingMinimizeBtn.setAttribute('aria-pressed', 'true');
                    elements.floatingMinimizeBtn.setAttribute('title', 'تكبير المشغل');
                    elements.floatingMinimizeBtn.setAttribute('aria-label', 'تكبير المشغل');
                }
            }
        } catch (e) {}

    // ensure main audio loop follows repeat state
    if (elements.mainAudio) elements.mainAudio.loop = !!isRepeat;

        // Bind floating player events
        bindFloatingPlayerEvents();
    }

    function bindFloatingPlayerEvents() {
        if (elements.floatingPrevBtn) {
            elements.floatingPrevBtn.addEventListener('click', function () {
                if (current > 0) {
                    loadSurah(current - 1, { autoplay: true });
                }
            });
        }

        if (elements.floatingNextBtn) {
            elements.floatingNextBtn.addEventListener('click', function () {
                if (current < surahs.length - 1) {
                    loadSurah(current + 1, { autoplay: true });
                }
            });
        }

        if (elements.floatingPlayBtn) {
            elements.floatingPlayBtn.addEventListener('click', function () {
                if (isPlaying) {
                    pauseCurrentSurah();
                } else {
                    playCurrentSurah();
                }
            });
        }

        // Repeat button
        if (elements.floatingRepeatBtn) {
            elements.floatingRepeatBtn.addEventListener('click', function () {
                isRepeat = !isRepeat;
                elements.floatingRepeatBtn.setAttribute('aria-pressed', String(!!isRepeat));
                elements.floatingRepeatBtn.style.background = isRepeat ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
                // ensure audio loop property follows
                if (elements.mainAudio) elements.mainAudio.loop = !!isRepeat;
            });
        }

        // Seek buttons
        if (elements.floatingSeekMinusBtn) {
            elements.floatingSeekMinusBtn.addEventListener('click', function () {
                seekByMinutes(-seekStepMinutes);
            });
        }

        if (elements.floatingSeekPlusBtn) {
            elements.floatingSeekPlusBtn.addEventListener('click', function () {
                seekByMinutes(seekStepMinutes);
            });
        }

        // Minimize button
        if (elements.floatingMinimizeBtn) {
            elements.floatingMinimizeBtn.addEventListener('click', function () {
                if (!elements.floatingPlayer) return;
                elements.floatingPlayer.classList.toggle('collapsed');
                const collapsed = elements.floatingPlayer.classList.contains('collapsed');
                // update accessible attributes
                elements.floatingMinimizeBtn.setAttribute('title', collapsed ? 'تكبير المشغل' : 'تصغير المشغل');
                elements.floatingMinimizeBtn.setAttribute('aria-pressed', String(!!collapsed));
                elements.floatingMinimizeBtn.setAttribute('aria-label', collapsed ? 'تكبير المشغل' : 'تصغير المشغل');
                // persist collapsed state for next visit
                try { localStorage.setItem('floatingPlayerCollapsed', collapsed ? '1' : '0'); } catch (e) {}
            });
        }

        // Update progress bar
        if (elements.mainAudio) {
            elements.mainAudio.addEventListener('timeupdate', updateProgressBar);
            elements.mainAudio.addEventListener('loadedmetadata', function() {
                updateProgressBar();
            });

            elements.mainAudio.addEventListener('ended', function () {
                // If repeat is enabled, the audio element will handle looping via .loop
                if (!isRepeat) {
                    // autoplay next surah if available
                    if (current < surahs.length - 1) {
                        loadSurah(current + 1, { autoplay: true });
                    } else {
                        isPlaying = false;
                        updateFloatingPlayer();
                    }
                }
            });

            elements.mainAudio.addEventListener('error', function (e) {
                console.error('Audio error:', e);
                isPlaying = false;
                updateFloatingPlayer();
                showError('حدث خطأ في تشغيل الصوت');
            });
        }
    }

    function updateProgressBar() {
        if (!elements.mainAudio || !elements.floatingProgressFill) return;
        
        const currentTime = elements.mainAudio.currentTime;
        const duration = elements.mainAudio.duration;
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            elements.floatingProgressFill.style.width = progress + '%';
            const handle = document.getElementById('floating-progress-handle');
            if (handle) handle.style.left = progress + '%';
            const bar = document.getElementById('floating-progress-bar');
            if (bar) bar.setAttribute('aria-valuenow', Math.round(progress));
            // update time display
            const timeEl = document.getElementById('floating-time');
            if (timeEl) timeEl.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }
    }

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0) return '00:00';
        const s = Math.floor(seconds % 60);
        const m = Math.floor((seconds % 3600) / 60);
        const h = Math.floor(seconds / 3600);
        const pad = (v) => (v < 10 ? '0' + v : '' + v);
        if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
        return `${pad(m)}:${pad(s)}`;
    }

    // Interactive progress bar seeking
    let isDraggingProgress = false;

    function pctFromEvent(evt, barEl) {
        const rect = barEl.getBoundingClientRect();
        const x = (evt.touches && evt.touches[0]) ? evt.touches[0].clientX : evt.clientX;
        let pct = (x - rect.left) / rect.width;
        if (pct < 0) pct = 0;
        if (pct > 1) pct = 1;
        return pct;
    }

    function initProgressInteraction() {
        const bar = document.getElementById('floating-progress-bar');
        if (!bar || !elements.mainAudio) return;

        // click to seek
        bar.addEventListener('click', function (e) {
            try {
                const pct = pctFromEvent(e, bar);
                const dur = elements.mainAudio.duration || 0;
                if (dur > 0) elements.mainAudio.currentTime = pct * dur;
                updateProgressBar();
            } catch (err) { console.error(err); }
        });

        // drag to seek (pointer events)
        bar.addEventListener('pointerdown', function (e) {
            isDraggingProgress = true;
            bar.setPointerCapture(e.pointerId);
        });

        window.addEventListener('pointermove', function (e) {
            if (!isDraggingProgress) return;
            try {
                const pct = pctFromEvent(e, bar);
                const dur = elements.mainAudio.duration || 0;
                if (dur > 0) {
                    // show preview while dragging but don't commit until pointerup
                    elements.floatingProgressFill.style.width = (pct * 100) + '%';
                    const handle = document.getElementById('floating-progress-handle');
                    if (handle) handle.style.left = (pct * 100) + '%';
                    const timeEl = document.getElementById('floating-time');
                    if (timeEl) timeEl.textContent = `${formatTime(pct * dur)} / ${formatTime(dur)}`;
                }
            } catch (err) { }
        });

        window.addEventListener('pointerup', function (e) {
            if (!isDraggingProgress) return;
            isDraggingProgress = false;
            try {
                const pct = pctFromEvent(e, bar);
                const dur = elements.mainAudio.duration || 0;
                if (dur > 0) elements.mainAudio.currentTime = pct * dur;
                updateProgressBar();
            } catch (err) { }
        });
    }

    // Seek by minutes relative to current position (positive or negative)
    function seekByMinutes(deltaMinutes) {
        if (!elements.mainAudio) return;
        try {
            const dur = elements.mainAudio.duration || 0;
            if (!isFinite(dur) || dur <= 0) return; // nothing to seek

            let newTime = (elements.mainAudio.currentTime || 0) + (deltaMinutes * 60);
            if (newTime < 0) newTime = 0;
            if (newTime > dur) newTime = dur;
            elements.mainAudio.currentTime = newTime;
            updateProgressBar();
        } catch (e) {
            console.error('Seek error:', e);
        }
    }

    function updateFloatingPlayer() {
        if (elements.floatingCurrentSurah) {
            elements.floatingCurrentSurah.textContent = `سورة ${surahs[current].name}`;
        }
        
        if (elements.floatingPlayIcon && elements.floatingPauseIcon) {
            if (isPlaying) {
                elements.floatingPlayIcon.style.display = 'none';
                elements.floatingPauseIcon.style.display = 'block';
                elements.floatingPlayBtn.setAttribute('aria-label', 'إيقاف');
            } else {
                elements.floatingPlayIcon.style.display = 'block';
                elements.floatingPauseIcon.style.display = 'none';
                elements.floatingPlayBtn.setAttribute('aria-label', 'تشغيل');
            }
        }
        // reflect repeat state visually
        if (elements.floatingRepeatBtn) {
            elements.floatingRepeatBtn.setAttribute('aria-pressed', String(!!isRepeat));
            elements.floatingRepeatBtn.style.background = isRepeat ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
        }
    }

    // Enhanced download function that works immediately
    function downloadSurah(surahIndex, surahName) {
        try {
            const surah = surahs[surahIndex];
            if (!surah) {
                throw new Error('Surah not found');
            }

            // Create invisible anchor element
            const downloadLink = document.createElement('a');
            downloadLink.href = surah.file;
            downloadLink.download = `سورة ${surah.name}.mp3`;
            downloadLink.style.display = 'none';
            
            // Add to document and trigger click
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Show download status
            showDownloadStatus(`جاري تحميل سورة ${surah.name}...`);

        } catch (error) {
            console.error('Download error:', error);
            // Fallback: open in new tab
            window.open(surahs[surahIndex].file, '_blank');
            showDownloadStatus(`تم فتح سورة ${surahs[surahIndex].name} في نافذة جديدة`);
        }
    }

    function showDownloadStatus(message) {
        // Create or update download status element
        let statusEl = document.getElementById('download-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'download-status';
            statusEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #0097e6;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(statusEl);
        }
        
        statusEl.textContent = message;
        statusEl.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }

    // Enhanced loadSurah with error handling
    function loadSurah(idx) {
        // accept optional options: { autoplay: boolean }
        const opts = arguments[1] || {};
        if (idx < 0) idx = 0;
        if (idx >= surahs.length) idx = surahs.length - 1;

        current = idx;

        try {
            if (elements.audioSource) {
                elements.audioSource.src = surahs[idx].file;
            }

            if (elements.mainAudio) {
                // make sure loop is in sync
                elements.mainAudio.loop = !!isRepeat;
                elements.mainAudio.load();
            }

            updateFloatingPlayer();
            updateActiveSurahHighlight();

            if (opts.autoplay) {
                // slight delay to allow load to start
                setTimeout(() => playCurrentSurah(), 50);
            }

        } catch (error) {
            console.error('Error loading surah:', error);
            showError('تعذر تحميل السورة');
        }
    }

    // Enhanced playSurah function
    function playSurah(idx) {
        loadSurah(idx, { autoplay: true });
    }

    function playCurrentSurah() {
        try {
            if (!elements.mainAudio) return;
            // ensure loop property matches repeat state
            elements.mainAudio.loop = !!isRepeat;

            elements.mainAudio.play().then(() => {
                isPlaying = true;
                updateFloatingPlayer();
            }).catch(error => {
                console.error('Play failed:', error);
                showError('تعذر تشغيل السورة');
                isPlaying = false;
                updateFloatingPlayer();
            });
        } catch (error) {
            console.error('Play error:', error);
            isPlaying = false;
            updateFloatingPlayer();
        }
    }

    function pauseCurrentSurah() {
        try {
            if (elements.mainAudio) {
                elements.mainAudio.pause();
            }
            isPlaying = false;
            updateFloatingPlayer();
        } catch (error) {
            console.error('Pause error:', error);
        }
    }

    function updateActiveSurahHighlight() {
        // Remove active class from all surah items
        document.querySelectorAll('.surah-list-item, .surah-table-row').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current surah
        const currentSurahItem = document.querySelector(`[data-index="${current}"]`);
        if (currentSurahItem) {
            currentSurahItem.closest('.surah-list-item, .surah-table-row')?.classList.add('active');
        }
    }

    function showError(message) {
        console.error(message);
    }

    // Enhanced surah list rendering
    function renderSurahList() {
        if (!elements.surahList) return;

        const fragment = document.createDocumentFragment();
        
        surahs.forEach(function (surah, i) {
            const li = document.createElement('li');
            li.className = 'surah-list-item';
            li.style.marginBottom = '3px';
            
            const a = document.createElement('a');
            a.textContent = surah.displayName;
            a.href = '#';
            a.className = 'surah-link';
            a.style.color = '#0097e6';
            a.style.textDecoration = 'none';
            a.style.display = 'block';
            a.style.padding = '2px 0';
            a.setAttribute('data-index', i);
            a.setAttribute('aria-label', `استمع إلى سورة ${surah.name}`);
            
            a.addEventListener('click', function (e) {
                e.preventDefault();
                playSurah(i);
            });
            
            li.appendChild(a);
            fragment.appendChild(li);
        });
        
        elements.surahList.appendChild(fragment);
    }

    // Enhanced table rendering with immediate download
    function renderSurahTable() {
        if (!elements.surahTableBody) return;

        const fragment = document.createDocumentFragment();
        
        surahs.forEach(function (surah, index) {
            const row = document.createElement('tr');
            row.className = 'surah-table-row';
            row.innerHTML = `
                <td>${surah.number}</td>
                <td>${surah.name}</td>
                <td>${surah.number} من 114</td>
                <td>
                    <button class="download-btn" data-index="${index}" 
                            aria-label="تحميل سورة ${surah.name}"
                            style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        تحميل
                    </button>
                </td>
                <td>
                    <button class="listen-btn" data-index="${index}" 
                            aria-label="استمع إلى سورة ${surah.name}"
                            style="background: #0097e6; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        استماع مباشر
                    </button>
                </td>
            `;
            fragment.appendChild(row);
        });
        
        elements.surahTableBody.appendChild(fragment);

        // Enhanced table event delegation
        elements.surahTableBody.addEventListener('click', function (e) {
            const downloadBtn = e.target.closest('.download-btn');
            if (downloadBtn) {
                const idx = parseInt(downloadBtn.getAttribute('data-index'), 10);
                if (!isNaN(idx)) {
                    downloadSurah(idx, surahs[idx].name);
                }
                return;
            }
            
            const listenBtn = e.target.closest('.listen-btn');
            if (listenBtn) {
                const idx = parseInt(listenBtn.getAttribute('data-index'), 10);
                if (!isNaN(idx)) playSurah(idx);
            }
        });
    }

    // Enhanced sidebar functionality
    function setupSidebar() {
        if (!elements.toggleBtn || !elements.sideMenu) return;

        function updateToggleButton() {
            const isHidden = elements.sideMenu.style.display === 'none';
            const label = isHidden ? 'إظهار القائمة' : 'إخفاء القائمة';
            
            elements.toggleBtn.textContent = label;
            elements.toggleBtn.setAttribute('aria-label', label);
            elements.toggleBtn.setAttribute('aria-expanded', String(!isHidden));
        }

        elements.toggleBtn.addEventListener('click', function () {
            const isHidden = elements.sideMenu.style.display === 'none';
            elements.sideMenu.style.display = isHidden ? '' : 'none';
            
            try {
                localStorage.setItem('sideMenuHidden', elements.sideMenu.style.display === 'none' ? '1' : '0');
            } catch (e) {}
            
            updateToggleButton();
        });

        // Load saved sidebar state
        try {
            if (localStorage.getItem('sideMenuHidden') === '1') {
                elements.sideMenu.style.display = 'none';
            }
        } catch (e) {}
        
        updateToggleButton();
    }

    // Initialize reciter name display
    function setReciterName() {
        try {
            const nameEl = document.querySelector('.reciter-name');
            if (nameEl && RECITER.name) {
                nameEl.textContent = RECITER.name;
                nameEl.setAttribute('aria-label', `قارئ: ${RECITER.name}`);
            }
        } catch (e) {}
    }

    // Remove old audio controls
    function removeOldAudioControls() {
        const oldControls = document.getElementById('audio-controls');
        if (oldControls) {
            oldControls.remove();
        }
    }

    // Remove old audio elements
    function removeOldAudioElements() {
        const oldAudio = document.getElementById('mainAudio');
        if (oldAudio) {
            oldAudio.remove();
        }
    }

    // Initialize the player
    function init() {
        // Remove old controls first
        removeOldAudioControls();
        removeOldAudioElements();
        
        renderSurahList();
        renderSurahTable();
        setupSidebar();
        setReciterName();
        createFloatingPlayer();
    loadSurah(current);
    // initialize interactive progress controls
    initProgressInteraction();
        
        console.log('Surah Player initialized successfully');
    }

    // Public API
    window.surahPlayer = {
        playSurah: playSurah,
        loadSurah: loadSurah,
        downloadSurah: downloadSurah,
        surahs: surahs,
        reciter: RECITER,
        getCurrentSurah: () => surahs[current],
        getPlayerState: () => ({ current, isPlaying, isRepeat }),
        toggleRepeat: function (val) {
            if (typeof val === 'boolean') isRepeat = val;
            else isRepeat = !isRepeat;
            if (elements.mainAudio) elements.mainAudio.loop = !!isRepeat;
            if (elements.floatingRepeatBtn) {
                elements.floatingRepeatBtn.setAttribute('aria-pressed', String(!!isRepeat));
                elements.floatingRepeatBtn.style.background = isRepeat ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
            }
            return isRepeat;
        },
        setSeekStepMinutes: function (mins) {
            const m = parseFloat(mins);
            if (isNaN(m) || !isFinite(m) || m <= 0) return false;
            seekStepMinutes = m;
            // update button titles to reflect step
            if (elements.floatingSeekMinusBtn) elements.floatingSeekMinusBtn.title = `تقديم -${seekStepMinutes} دقيقة`;
            if (elements.floatingSeekPlusBtn) elements.floatingSeekPlusBtn.title = `تقديم +${seekStepMinutes} دقيقة`;
            if (elements.floatingSeekMinusBtn) elements.floatingSeekMinusBtn.textContent = `-${seekStepMinutes}m`;
            if (elements.floatingSeekPlusBtn) elements.floatingSeekPlusBtn.textContent = `+${seekStepMinutes}m`;
            return true;
        },
        getSeekStepMinutes: function () { return seekStepMinutes; }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();