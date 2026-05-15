var board = null;
var game = new Chess();
var bossText = document.getElementById('boss-text');

function updateClock() {
    var now = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('clock').innerText = now.toLocaleDateString('tr-TR', options);
}
setInterval(updateClock, 1000);
updateClock();

const rabbitHole = [
    { cat: "Mekanik Gerçekler", desc: "V8 motorların o efsanevi senfonisi, ateşleme sırasındaki asimetrik boşluklardan doğar.", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=400" },
    { cat: "Klinik Anatomi", desc: "EKG kağıdındaki her 1 mm'lik kare 0.04 saniyedir. Kalbin sırları bu ufak karelerde gizlidir.", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=400" },
    { cat: "İnsan Psikolojisi", desc: "Kusursuz bir hafıza ve deha, bazen sadece geçmişin acılarından kaçmak için örülmüş bir duvardır.", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400" },
    { cat: "Kozmik Paradoks", desc: "Olay ufkuna yaklaşan birini izlersen, o kişinin zamanla donduğunu görürsün. Zaman, sadece bir illüzyondur.", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=400" }
];

function showRandomInfo() {
    const container = document.getElementById('rabbit-hole-container');
    container.innerHTML = '';
    let shuffled = rabbitHole.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 2);
    
    selected.forEach(info => {
        container.innerHTML += `
            <div class="info-card">
                <img src="${info.img}" class="info-img">
                <div class="info-content">
                    <div class="info-cat">${info.cat}</div>
                    <p class="info-desc">${info.desc}</p>
                </div>
            </div>
        `;
    });
}

const bossLines = [
    "Bu hamleyi yaparken çok düşündün mü?",
    "Zayıf bir nokta arıyorsun ama yok.",
    "Beni yenebileceğini düşündüren şey ne?",
    "İlginç bir feda... Ama yetersiz.",
    "Tahtadaki her taşın bir ruhu var. Seninkiler korkuyor."
];

function onDrop(source, target) {
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    bossText.innerText = bossLines[Math.floor(Math.random() * bossLines.length)];
    showRandomInfo();
    window.setTimeout(makeBestMove, 300);
}

function makeBestMove() {
    var moves = game.moves();
    if (moves.length === 0) {
        bossText.innerText = "Şah mat. Oyun bitti.";
        return;
    }
    moves.sort(() => Math.random() - 0.5); 
    game.move(moves[0]);
    board.position(game.fen());
}

board = Chessboard('myBoard', {
    draggable: true,
    position: 'start',
    onDrop: onDrop,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});

showRandomInfo();
          
