let thumbnails = [];
let currentIndex = 0;

// Thumbnails show img/thumb/<name>; the large image is img/web/<name>; the original is img/<name>.
const largeSrc = t => t.dataset.full || t.getAttribute('src');

function showImage(index) {
    if (!thumbnails.length) return;
    currentIndex = (index + thumbnails.length) % thumbnails.length;
    const thumb = thumbnails[currentIndex];
    const main = document.getElementById('mainImage');
    main.src = largeSrc(thumb);
    main.alt = thumb.alt;
    document.getElementById('fullSizeLink').href = largeSrc(thumb).replace('img/web/', 'img/');

    thumbnails.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    keepThumbInView(thumb);
    document.getElementById('imageCounter').textContent =
        (currentIndex + 1) + ' / ' + thumbnails.length;

    // Warm the cache for the neighbours so next/prev feel instant.
    [currentIndex + 1, currentIndex - 1].forEach(i => {
        const n = thumbnails[(i + thumbnails.length) % thumbnails.length];
        new Image().src = largeSrc(n);
    });
}

// Scroll the thumbnail panel (not the page) so the active thumbnail is visible.
function keepThumbInView(thumb) {
    const panel = document.getElementById('thumbnails');
    if (!panel) return;
    const p = panel.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    if (t.top < p.top) panel.scrollTop -= p.top - t.top + 10;
    else if (t.bottom > p.bottom) panel.scrollTop += t.bottom - p.bottom + 10;
}

// Called by each thumbnail's onclick.
function updateMainImage(imageSrc) {
    const index = thumbnails.findIndex(t => largeSrc(t) === imageSrc);
    if (index !== -1) showImage(index);
    else document.getElementById('mainImage').src = imageSrc;

    // Bring the large image into view when a thumbnail far down the grid is clicked.
    const main = document.getElementById('mainImage');
    const rect = main.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
        main.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
    const main = document.getElementById('mainImage');
    const start = thumbnails.findIndex(t => largeSrc(t) === main.getAttribute('src'));
    showImage(start === -1 ? 0 : start);

    const copyBtn = document.getElementById('copyVin');
    copyBtn.addEventListener('click', () => {
        const vin = document.getElementById('vinValue').textContent.trim();
        const done = () => {
            copyBtn.textContent = 'Copied';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(vin).then(done, () => {});
    });

    document.getElementById('prevBtn').addEventListener('click', () => showImage(currentIndex - 1));
    document.getElementById('nextBtn').addEventListener('click', () => showImage(currentIndex + 1));

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { showImage(currentIndex - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { showImage(currentIndex + 1); e.preventDefault(); }
    });

    // Swipe left/right on the large image (phones).
    let touchX = null;
    main.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) showImage(currentIndex + (dx < 0 ? 1 : -1));
        touchX = null;
    });
});
