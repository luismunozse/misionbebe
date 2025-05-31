// ---------- Variables globales ----------
let currentLevel = 0;
const totalLevels = 3;

// ---------- Inicio ----------
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startBtn').onclick = () => {
        document.getElementById('startScreen').classList.add('hidden');
        nextLevel();
    };
});

// ---------- Gestor de niveles ----------
function nextLevel(){
    currentLevel++;
    
    // Ocultar TODOS los niveles explícitamente
    const startScreen = document.getElementById('startScreen');
    const anagramZone = document.getElementById('anagramZone');
    const memoryZone = document.getElementById('memoryZone');
    const puzzleZone = document.getElementById('puzzleZone');
    const finalZone = document.getElementById('finalZone');
    
    if(startScreen) startScreen.classList.add('hidden');
    if(anagramZone) anagramZone.classList.add('hidden');
    if(memoryZone) memoryZone.classList.add('hidden');
    if(puzzleZone) puzzleZone.classList.add('hidden');
    if(finalZone) finalZone.classList.add('hidden');
    
    // Mostrar el nivel correspondiente
    if(currentLevel === 1) {
        initAnagram();
    } else if(currentLevel === 2) {
        initMemory();
    } else if(currentLevel === 3) {
        initPuzzle();
    } else if(currentLevel > totalLevels) {
        finalZone.classList.remove('hidden');
        // new Audio('https://cdn.pixabay.com/download/audio/2022/09/20/audio_5261e17f4f.mp3?filename=party-horn-99534.mp3').play();
    }
}

/* -------- Nivel 1: Anagramas -------- */
const anagramWords = ['PAÑALES','BABERO','SONAJERO','PATITO','CHUPETE','MAMADERA'];
let anaIndex = 0;

function initAnagram(){
    // Resetear índice
    anaIndex = 0;
    
    // Mostrar zona del anagrama
    const zone = document.getElementById('anagramZone');
    zone.classList.remove('hidden');
    
    // Configurar primera palabra
    showScrambled();
    
    // Configurar input
    const input = document.getElementById('anagramInput');
    input.value = '';
    input.focus();
    
    // Limpiar eventos anteriores
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Agregar eventos al nuevo input
    newInput.addEventListener('input', toUpperCaseInput);
    newInput.addEventListener('keydown', checkEnter);
    
    // Configurar botón
    document.getElementById('checkAna').onclick = checkAnagram;
}

function showScrambled(){
    const word = anagramWords[anaIndex];
    document.getElementById('scrambled').textContent = shuffle(word.split('')).join('');
    document.getElementById('anagramInput').value = '';
    document.getElementById('anaFeedback').textContent = '';
}

function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function toUpperCaseInput(e){
    e.target.value = e.target.value.toUpperCase();
}

function checkAnagram(){
    const input = document.getElementById('anagramInput').value.trim().toUpperCase();
    
    if(input === anagramWords[anaIndex]){
        anaIndex++;
        
        if(anaIndex === anagramWords.length){
            // Todas las palabras completadas
            nextLevel();
            return;
        }
        
        // Mostrar siguiente palabra
        showScrambled();
    } else {
        document.getElementById('anaFeedback').textContent = 'Intenta de nuevo 😉';
    }
}

function checkEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkAnagram();
    }
}

/* -------- Nivel 2: Memory -------- */
const memImgs = ['chupete','babero','sonajero','mamadera','patito','pañal'];
let firstCard = null;
let lockBoard = false;
let matches = 0;

function initMemory(){
    // Resetear variables
    matches = 0;
    lockBoard = false;
    firstCard = null;
    
    // Mostrar zona de memoria
    const zone = document.getElementById('memoryZone');
    zone.classList.remove('hidden');
    
    // Limpiar grid
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    // Crear cartas
    const cards = [...memImgs, ...memImgs].map(src => ({
        src, 
        id: Math.random().toString(36).substr(2, 9)
    }));
    shuffle(cards);
    
    // Agregar cartas al grid
    cards.forEach(c => {
        grid.insertAdjacentHTML('beforeend', `
        <div class="card" data-src="${c.src}">
            <div class="inner">
                <div class="face front"></div>
                <div class="face back"><img src="img/${c.src}.png" style="width:70%;"></div>
            </div>
        </div>`);
    });
    
    // Agregar eventos a las cartas
    grid.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', flipCard);
        card.addEventListener('touchstart', flipCard, {passive: true});
    });
}

function flipCard(){
    if(lockBoard || this === firstCard || this.classList.contains('flipped')) return;
    
    this.classList.add('flipped');
    
    if(!firstCard){
        firstCard = this;
        return;
    }
    
    // Verificar si es pareja
    if(this.dataset.src === firstCard.dataset.src){
        matches++;
        resetTurn();
        
        // Verificar si se completó el nivel
        if(matches === memImgs.length){
            setTimeout(() => nextLevel(), 1000);
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            this.classList.remove('flipped');
            firstCard.classList.remove('flipped');
            resetTurn();
        }, 1000);
    }
}

function resetTurn(){
    firstCard = null;
    lockBoard = false;
}

/* -------- Nivel 3: Puzzle -------- */
function initPuzzle() {
    const size = 3;
    const puzzleContainer = document.getElementById('puzzleContainer');
    puzzleContainer.innerHTML = '';
    puzzleContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    const imageSrc = 'img/bebe.gif';

    // Crear piezas
    const pieces = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            pieces.push({ x, y, idx: y * size + x });
        }
    }

    shuffle(pieces);

    pieces.forEach((p, i) => {
        const piece = document.createElement('div');
        piece.classList.add('pPiece');
        piece.draggable = true;
        piece.dataset.idx = p.idx;
        piece.dataset.current = i;
        piece.style.order = i;

        // El truco: background-position en %
        piece.style.backgroundImage = `url('${imageSrc}')`;
        piece.style.backgroundSize = `${size * 100}% ${size * 100}%`;
        piece.style.backgroundPosition = `${(p.x * 100) / (size - 1)}% ${(p.y * 100) / (size - 1)}%`;

        puzzleContainer.appendChild(piece);
    });

    // ... (el resto de tu código de eventos y swapPieces igual que antes)
    puzzleContainer.querySelectorAll('.pPiece').forEach(el => {
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text', el.dataset.current);
        });

        el.addEventListener('dragover', e => e.preventDefault());

        el.addEventListener('drop', function (e) {
            e.preventDefault();
            const fromPos = e.dataTransfer.getData('text');
            const toPos = this.dataset.current;
            swapPieces(fromPos, toPos);
            if (isSolved()) {
                setTimeout(() => nextLevel(), 500);
            }
        });

        // Touch events para móviles
        let touchStart = null;
        el.addEventListener('touchstart', function (e) {
            touchStart = this;
        }, { passive: true });

        el.addEventListener('touchend', function (e) {
            const touch = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            if (touch && touch.classList.contains('pPiece') && touch !== touchStart) {
                swapPieces(touchStart.dataset.current, touch.dataset.current);
                if (isSolved()) {
                    setTimeout(() => nextLevel(), 500);
                }
            }
            touchStart = null;
        }, { passive: true });
    });

    function swapPieces(pos1, pos2) {
        const pieces = [...puzzleContainer.children];
        const piece1 = pieces.find(p => p.dataset.current === pos1);
        const piece2 = pieces.find(p => p.dataset.current === pos2);

        if (piece1 && piece2 && piece1 !== piece2) {
            [piece1.dataset.current, piece2.dataset.current] = [piece2.dataset.current, piece1.dataset.current];
            [piece1.style.order, piece2.style.order] = [piece2.style.order, piece1.style.order];
        }
    }

    function isSolved() {
        const pieces = [...puzzleContainer.children];
        return pieces.every(piece => piece.dataset.idx === piece.dataset.current);
    }
}