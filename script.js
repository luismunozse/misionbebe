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
    // Ocultar el nivel actual
    if (currentLevel === 0) {
        document.getElementById('startScreen').classList.add('hidden');
    } else if (currentLevel === 1) {
        document.getElementById('anagramZone').classList.add('hidden');
    } else if (currentLevel === 2) {
        document.getElementById('memoryZone').classList.add('hidden');
    } else if (currentLevel === 3) {
        document.getElementById('puzzleZone').classList.add('hidden');
    }

    currentLevel++;

    // Mostrar el nivel correspondiente con animación
    setTimeout(() => {
        if(currentLevel === 1) {
            initAnagram();
            const zone = document.getElementById('anagramZone');
            zone.classList.remove('hidden');
            zone.classList.add('level-transition');
        } else if(currentLevel === 2) {
            initMemory();
            const zone = document.getElementById('memoryZone');
            zone.classList.remove('hidden');
            zone.classList.add('level-transition');
        } else if(currentLevel === 3) {
            initPuzzle();
            const zone = document.getElementById('puzzleZone');
            zone.classList.remove('hidden');
            zone.classList.add('level-transition');
        } else if(currentLevel > totalLevels) {
            // Mostrar el mensaje final con animación
            showMessageFinal();
        }
    }, 500);
}

/* -------- Nivel 1: Anagramas -------- */
const anagramWords = ['PAÑALES','BABERO','SONAJERO','PATITO','CHUPETE','MAMADERA'];
const anagramImages = ['./img/pañal.png','./img/babero.png','./img/sonajero.png','./img/patito.png','./img/chupete.png','./img/mamadera.png'];
let anaIndex = 0;

function initAnagram(){
    anaIndex = 0;
    showScrambled();
    
    const input = document.getElementById('anagramInput');
    input.value = '';
    
    // Limpiar eventos anteriores
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    newInput.addEventListener('input', toUpperCaseInput);
    newInput.addEventListener('keydown', checkEnter);
    
    document.getElementById('checkAna').onclick = checkAnagram;
    
    // Focus después de la animación
    setTimeout(() => newInput.focus(), 200);
}

function showScrambled(){
    const word = anagramWords[anaIndex];
    document.getElementById('scrambled').textContent = shuffle(word.split('')).join('');
    document.getElementById('anagramInput').value = '';
    document.getElementById('anaFeedback').textContent = '';
    document.getElementById('anagramImage').src = anagramImages[anaIndex]; // Actualizamos la imagen
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
            nextLevel();
            return;
        }
        
        showScrambled();
        document.getElementById('anagramInput').focus();
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
    matches = 0;
    lockBoard = false;
    firstCard = null;
    
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    const cards = [...memImgs, ...memImgs].map(src => ({
        src, 
        id: Math.random().toString(36).substr(2, 9)
    }));
    shuffle(cards);
    
    cards.forEach(c => {
        grid.insertAdjacentHTML('beforeend', `
        <div class="card" data-src="${c.src}">
            <div class="inner">
                <div class="face front"></div>
                <div class="face back"><img src="img/${c.src}.png" style="width:70%;"></div>
            </div>
        </div>`);
    });
    
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
    
    if(this.dataset.src === firstCard.dataset.src){
        matches++;
        resetTurn();
        
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

        piece.style.backgroundImage = `url('${imageSrc}')`;
        piece.style.backgroundSize = `${size * 100}% ${size * 100}%`;
        piece.style.backgroundPosition = `${(p.x * 100) / (size - 1)}% ${(p.y * 100) / (size - 1)}%`;

        puzzleContainer.appendChild(piece);
    });

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
                // Mostrar el mensaje final al completar el puzzle
                console.log('¡Rompecabezas resuelto!'); // Agregamos un mensaje de registro
                setTimeout(showMessageFinal, 500); // Mostrar después de 500ms
            }
        });

        let touchStart = null;
        el.addEventListener('touchstart', function (e) {
            touchStart = this;
        }, { passive: true });

        el.addEventListener('touchend', function (e) {
            const touch = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            if (touch && touch.classList.contains('pPiece') && touch !== touchStart) {
                swapPieces(touchStart.dataset.current, touch.dataset.current);
                if (isSolved()) {
                    // Mostrar el mensaje final al completar el puzzle
                    console.log('¡Rompecabezas resuelto!'); // Agregamos un mensaje de registro
                    setTimeout(showMessageFinal, 500); // Mostrar después de 500ms
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

/* -------- Mensaje Final -------- */
function showMessageFinal() {
    document.getElementById('puzzleZone').classList.add('hidden'); // Oculta el puzzle
    const finalZone = document.getElementById('finalZone');
    finalZone.classList.remove('hidden');
    finalZone.classList.add('level-transition');
    console.log('¡Mensaje final mostrado!'); // Agregamos un mensaje de registro
}