// ==========================================
// THE VOIDZA CORE ENGINE - v3.0 (ULTIMATE EDITION)
// BÖLÜM 1: ÇEKİRDEK HAFIZA, DOM BAĞLANTILARI VE DEVASA VERİ HAVUZU
// ==========================================
"use strict";

console.log("[VOIDZA SYS] Dev motor ateşleniyor...");

// --- 1. ÇEKİRDEK SİSTEM DEĞİŞKENLERİ (STATE MANAGEMENT) ---
// Tahtanın ve oyunun o anki durumunu hafızada tutan ana sinir ağı
let board = null;
const game = new Chess();
let sourceSquare = null;  // Click-to-move için seçilen ilk kare
let isProcessing = false; // Sistemin aynı anda iki işlem yapmasını engelleyen güvenlik kilidi

// --- 2. ZAMAN MOTORU DEĞİŞKENLERİ ---
// Sen ve The Architect için acımasız geri sayım
let playerTime = 600;  // 600 saniye = 10 Dakika
let bossTime = 600;    // 600 saniye = 10 Dakika
let playerTurn = true; // Her zaman Beyaz (Oyuncu) başlar
let timerInterval = null;

// --- 3. ARAYÜZ (DOM) KÖPRÜLERİ ---
// HTML içindeki elementleri JavaScript'e bağlayan kablolar
let elPlayerTimer = null;
let elBossTimer = null;
let elRealTimeClock = null;
let elRabbitContainer = null;
let bossText = null;

// Sayfa tamamen yüklendiğinde kabloları fişe takıyoruz
$(document).ready(function() {
    console.log("[VOIDZA SYS] Arayüz tarandı, elementler sisteme entegre ediliyor...");
    
    elPlayerTimer = document.getElementById('player-timer');
    elBossTimer = document.getElementById('boss-timer');
    elRealTimeClock = document.getElementById('real-time-clock');
    elRabbitContainer = document.getElementById('rabbit-hole-container');
    bossText = document.getElementById('boss-text');
    
    if(!bossText) console.warn("[SİSTEM UYARISI] The Architect'in ses telleri bulunamadı!");
});

// --- 4. THE ARCHIVE (DEVASA TAVŞAN DELİĞİ VERİTABANI) ---
// Sistem her 10 saniyede bir bu okyanustan rastgele veya sırayla kart çekecek.
// İleride bu listeyi 50, 100, 500'e kadar çıkarabilirsin.
const rabbitHoleData = [
    { 
        cat: "Fizik / Drift", 
        desc: "Kusursuz drift için arka tekerleklerin dönüş hızı, ön tekerleklerin açısından en az %20 daha fazla olmalıdır. Aksi takdirde araç 'understeer' yaşar.", 
        img: "https://images.unsplash.com/photo-1543393470-bce4caa028db?auto=format&fit=crop&w=400&q=80", 
        url: "pages/drift.html" 
    },
    { 
        cat: "Mekanik / V8", 
        desc: "V8 motorların o efsanevi senfonisi, 1-8-4-3-6-5-7-2 ateşleme sırasındaki asimetrik boşluklardan ve egzoz manifoldunun tasarımından doğar.", 
        img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80", 
        url: "pages/v8.html" 
    },
    { 
        cat: "Klinik Anatomi", 
        desc: "EKG'de V1-V6 göğüs derivasyonları kalbe yatay düzlemde bakarken, D1-D3 ekstremite derivasyonları elektriksel ekseni dikey düzlemde analiz eder.", 
        img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&q=80", 
        url: "pages/ekg.html" 
    },
    { 
        cat: "Psikoloji / Sinema", 
        desc: "Good Will Hunting filminde Will'in dehası, aslında insanlardan duygusal olarak uzak durmak ve incinmemek için ördüğü kusursuz bir kalkandır.", 
        img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80", 
        url: "pages/good-will.html" 
    },
    { 
        cat: "Müzik Teorisi", 
        desc: "Meshuggah gibi grupların poliritmik yapılarında 4/4'lük temel metronom üzerinde 23/16 gibi asimetrik riffler üst üste biner. Beyni yorar ama hipnotize eder.", 
        img: "https://images.unsplash.com/photo-1598368195835-91e67f80c9d7?auto=format&fit=crop&w=400&q=80", 
        url: "pages/poliritim.html" 
    },
    { 
        cat: "Müzik / Sludge", 
        desc: "Mastodon gibi gruplar, progresif rock elementlerini ağır metal riffleriyle birleştirerek Moby Dick gibi edebi eserleri devasa konsept albümlere dönüştürür.", 
        img: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&q=80", 
        url: "pages/mastodon.html" 
    },
    { 
        cat: "Müzik / Death Metal", 
        desc: "Bolt Thrower'ın sarsılmaz ritmik yapısı ve boğuk gitarları, savaşın amansız ve mekanik doğasını doğrudan müzikal bir forma sokar.", 
        img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80", 
        url: "pages/bolt.html" 
    },
    { 
        cat: "Veteriner Hekimlik", 
        desc: "Kedilerin karaciğerleri bazı kimyasalları sentezleyemez; özellikle insanların kullandığı saç bakım ürünlerindeki toksinlerin solunması onlar için anında ölümcül olabilir.", 
        img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80", 
        url: "pages/kedi-toksik.html" 
    },
    { 
        cat: "Biyomekanik", 
        desc: "Vücut ağırlığıyla yapılan barfiks (pull-up) ve squat gibi egzersizler, makinelere kıyasla aynı anda birden fazla büyük kas grubunu çalıştırarak hipertrofiyi maksimize eder.", 
        img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80", 
        url: "pages/squat.html" 
    },
    { 
        cat: "Odyofili", 
        desc: "In-ear monitor (IEM) kulaklıklarda KZ veya Moondrop gibi markaların kullandığı dengeli armatür (BA) sürücüleri, dinamik sürücülere göre çok daha analitik bir ses sunar.", 
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", 
        url: "pages/iem.html" 
    },
    { 
        cat: "Yapay Zeka / Üretim", 
        desc: "Suno AI ve Udio gibi algoritmalar, sadece notaları değil, insan sesindeki o 'kusurlu' duyguyu bile matematiksel olarak simüle edebilir.", 
        img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80", 
        url: "pages/suno.html" 
    },
    { 
        cat: "Satranç Tarihi", 
        desc: "Shannon Sayısı (10^120), satrançtaki olası oyun varyasyonlarının, gözlemlenebilir evrendeki toplam atom sayısından katbekat fazla olduğunu kanıtlar.", 
        img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=400&q=80", 
        url: "pages/shannon.html" 
    },
    { 
        cat: "Satranç / Analiz", 
        desc: "Lichess ve Chess.com gibi platformlarda oyuncunun hamle doğruluğu, Stockfish motorunun 'Centipawn Loss' (CPL) matematiksel modeline göre hesaplanır.", 
        img: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=400&q=80", 
        url: "pages/lichess.html" 
    },
    { 
        cat: "Gastronomi", 
        desc: "Bir zurna dürümün asıl lezzet sırrı sadece içindeki malzemede değil; ekmeğin kendi yağıyla mühürlenip (Maillard reaksiyonu) bol acılı sosu emmesindedir.", 
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80", 
        url: "pages/gastronomi.html" 
    },
    { 
        cat: "Sinema / Mizah", 
        desc: "The Dictator filmi, otoriter rejimlerin absürtlüklerini abartılı bir hicivle sunarken, aslında modern demokrasilerin zayıflıklarına da sert bir ayna tutar.", 
        img: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=400&q=80", 
        url: "pages/dictator.html" 
    },
    { 
        cat: "Televizyon / Klinik", 
        desc: "Hekimoğlu serilerinde her bölümün temel felsefesi tektir: 'Herkes yalan söyler, gerçekleri sadece semptomlar ve laboratuvar sonuçları gösterir.'", 
        img: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=400&q=80", 
        url: "pages/hekimoglu.html" 
    },
    { 
        cat: "Simülasyon / Fizik", 
        desc: "Real Racing 3 ve CarX Drift Racing gibi üst düzey mobil simülasyonlarda lastik aşınma fiziği, pistin sıcaklığına ve telemetri verilerine göre anlık hesaplanır.", 
        img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80", 
        url: "pages/simracing.html" 
    },
    { 
        cat: "Nörobilim", 
        desc: "Derin düşünme sırasında beynin Prefrontal Korteks'i devasa miktarda glikoz yakar. Zorlu bir satranç maçı insanı fiziksel olarak da bitirir.", 
        img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80", 
        url: "pages/neuro.html" 
    },
    { 
        cat: "Metal Efsaneleri", 
        desc: "Black Sabbath'ın karanlık tonu, Tony Iommi'nin fabrikada parmak uçlarını kaybettikten sonra telleri gevşetip çalmak zorunda kalmasıyla tesadüfen doğmuştur.", 
        img: "https://images.unsplash.com/photo-1598368195835-91e67f80c9d7?auto=format&fit=crop&w=400&q=80", 
        url: "pages/blacksabbath.html" 
    },
    { 
        cat: "Kozmoloji", 
        desc: "Olay ufkuna (Event Horizon) yaklaşan bir cismin zamanı, dışarıdaki bir gözlemciye göre sonsuza dek yavaşlar. Buna 'Time Dilation' denir.", 
        img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80", 
        url: "pages/blackhole.html" 
    }
];
// ==========================================
// PART 1 SONU
// ==========================================
// ==========================================
// BÖLÜM 2: TAVŞAN DELİĞİ MOTORU VE ÖLÜM SAATLERİ (COUNTDOWN)
// ==========================================

console.log("[VOIDZA SYS] Görsel motorlar ve geri sayım algoritmaları yükleniyor...");

// --- 5. TAVŞAN DELİĞİ RENDER MOTORU ---
let currentCardIndex = 0;

function renderRabbitHole() {
    // Eğer HTML'de kutuyu bulamazsa hata vermesin diye güvenlik önlemi
    if (!elRabbitContainer) return;
    
    const data = rabbitHoleData[currentCardIndex];
    
    // Kartı, tıklanınca ilgili sayfaya gidecek şekilde ekrana basıyoruz
    elRabbitContainer.innerHTML = `
        <div class="info-card active" onclick="window.location.href='${data.url}'">
            <img src="${data.img}" class="info-img" alt="${data.cat}">
            <div class="info-content">
                <div class="info-cat">${data.cat}</div>
                <p class="info-desc">${data.desc}</p>
            </div>
        </div>
    `;
    
    // Sıradaki karta geç, listenin sonuna ulaştıysa başa dön
    currentCardIndex = (currentCardIndex + 1) % rabbitHoleData.length;
}

// Sistemi beklemeden ilk kartı hemen bas ve 10 saniyelik döngüye al
renderRabbitHole();
setInterval(renderRabbitHole, 10000); 

// --- 6. ÖLÜM SAATLERİ (COUNTDOWN ENGINE) ---
function startTimer() {
    // Aynı anda iki saat çalışıp bug yapmasın diye eski saati temizliyoruz
    if (timerInterval) clearInterval(timerInterval);
    
    console.log("[VOIDZA SYS] Geri sayım başladı. Sıra: " + (playerTurn ? "Beyaz (Sen)" : "Siyah (Architect)"));

    timerInterval = setInterval(() => {
        // Eğer oyun mat veya beraberlikle bittiyse saati durdur
        if (game && game.game_over()) {
            clearInterval(timerInterval);
            return;
        }

        // Sıra kimdeyse onun süresini 1 saniye düşür
        if (playerTurn) {
            playerTime--;
            if (playerTime <= 0) { 
                clearInterval(timerInterval);
                playerTime = 0; // Eksiye düşmesini engelle
                if(bossText) bossText.innerText = "Süren doldu. Hamle yapamayacak kadar yavaşsın.";
                console.warn("[SİSTEM] Oyuncunun süresi bitti.");
            }
        } else {
            bossTime--;
            if (bossTime <= 0) { 
                clearInterval(timerInterval);
                bossTime = 0; 
                if(bossText) bossText.innerText = "Sistemimde zaman aşımı... Kodlarımla oynayan sen misin?";
                console.warn("[SİSTEM] Boss'un süresi bitti.");
            }
        }
        
        // Eksilen saniyeyi ekrana bas
        updateClocks();
    }, 1000);
}

// ==========================================
// PART 2 SONU
// ==========================================
// ==========================================
// BÖLÜM 3: TAKTİKSEL ARAYÜZ (CLICK-TO-MOVE) MOTORU
// ==========================================

console.log("[VOIDZA SYS] Taktiksel hamle motoru devreye giriyor...");

// --- 7. PARLAKLIK (HIGHLIGHT) KONTROLLERİ ---
// Tahtada kalan eski parlamaları temizleyen fonksiyon
function removeHighlights() {
    $('#myBoard .square-55d63').removeClass('highlight-square');
}

// Seçilen taşı ve gidebileceği geçerli hedefleri parlatan fonksiyon
function addHighlight(square) {
    $('#myBoard .square-' + square).addClass('highlight-square');
}

// --- 8. TIKLAMA VE HAMLE ANALİZİ ---
// Satranç tahtasındaki herhangi bir kareye tıklandığında sistemin vereceği tepki
$('#myBoard').on('click', '.square-55d63', function() {
    
    // Güvenlik Kilidi: Eğer sıra sende değilse, oyun bittiyse veya sistem düşünüyorsa tıklamayı reddet
    if (!playerTurn || isProcessing || game.game_over()) return;

    const square = $(this).attr('data-square'); // Tıklanan karenin koordinatını al (Örn: 'e4')
    const piece = game.get(square); // O karede taş var mı kontrol et

    // DURUM 1: Henüz bir taş SEÇİLMEDİYSE ve tıkladığın karede SENİN (Beyaz) taşın varsa
    if (sourceSquare === null && piece && piece.color === 'w') {
        sourceSquare = square; // Bu taşı beynin kısa süreli hafızasına al
        
        // Bu taşın gidebileceği tüm kurallı hedefleri hesapla
        const moves = game.moves({ square: square, verbose: true });
        
        addHighlight(square); // Seçtiğin taşı aydınlat
        moves.forEach(m => addHighlight(m.to)); // Gidebileceği tüm hedefleri aydınlat
        return;
    }

    // DURUM 2: Zaten bir taş SEÇİLİYSE ve şimdi bir hedefe tıkladıysan (Hamle denemesi)
    if (sourceSquare !== null) {
        // Hamleyi resmi olarak satranç motorunda yapmayı dene ('q' otomatik vezir terfisi)
        const move = game.move({ from: sourceSquare, to: square, promotion: 'q' });
        removeHighlights(); // İşlem bitince tüm aydınlatmaları kapat

        // Eğer hamle KURALDIŞI ise (move === null)
        if (move === null) {
            sourceSquare = null; // Hafızayı sıfırla
            
            // Eğer tıklanan geçersiz hedef, YİNE senin başka bir taşınsa, seçimi o taşa kaydır (Pratiklik)
            if (piece && piece.color === 'w') {
                sourceSquare = square;
                const moves = game.moves({ square: square, verbose: true });
                addHighlight(square);
                moves.forEach(m => addHighlight(m.to));
            }
            return;
        }

        // --- HAMLE BAŞARILI VE KURALA UYGUNSA ---
        sourceSquare = null; // Seçim hafızasını temizle
        board.position(game.fen()); // Tahtadaki taşların yeni konumunu ekrana fiziksel olarak çiz
        
        playerTurn = false; // Hamle sırasını "The Architect"e geçir
        isProcessing = true; // Spam tıklamaları engellemek için sisteme kilit vur
        
        startTimer(); // Zaman motorunu tetikle (Artık Boss'un süresi azalacak)
        
        // The Architect'in tepkisi
        if (bossText) {
            bossText.innerText = "Hamlen analiz ediliyor... Kusurlarını buradan bile görebiliyorum.";
        }
        
        // Sistemi biraz bekletip (insansı bir gecikme), Stockfish Yapay Zekasını çağırıyoruz
        // NOT: triggerStockfishAI fonksiyonu PART 4'te eklenecek!
        setTimeout(triggerStockfishAI, 800); 
    }
});

// ==========================================
// PART 3 SONU
// ==========================================
// ==========================================
// BÖLÜM 4: YAPAY ZEKA SİNİR AĞI (STOCKFISH 16.1) VE KİŞİLİK MOTORU
// ==========================================

console.log("[VOIDZA SYS] Stockfish 16.1 sinir ağına bağlanılıyor...");

// --- 9. THE ARCHITECT'İN BİLİNCİ (LAF SOKMA MOTORU) ---
const architectQuotes = [
    "Bu hamleyi yaparken gerçekten düşündün mü? Üzücü.",
    "Savunmanı beğendim. Tam bir amatör işi.",
    "Tahtaya bakmıyorsun, sadece taşları hareket ettiriyorsun.",
    "O piyonu orada feda etmen... Trajikomik.",
    "Merak etme, canını hızlı alacağım.",
    "Senin hamleni beklerken V8 motorların asimetrik ateşlemesini düşünüyordum. Sıkıcısın.",
    "Milyarlarca ihtimali saniyede hesaplıyorum. Sen ise hala 'acaba' diyorsun."
];

function triggerBossPersona(isError = false) {
    if (!bossText) return;
    
    // Eğer internet giderse veya API çökerse bahaneyi uydur
    if (isError) {
        bossText.innerText = "Ağ bağlantımda bir parazit var... Ama seni körü körüne de yenerim.";
        return;
    }
    
    // Rastgele bir laf sok
    const randomIndex = Math.floor(Math.random() * architectQuotes.length);
    bossText.innerText = architectQuotes[randomIndex];
}

// --- 10. OYUN BİTİŞ KONTROL MOTORU ---
function handleGameOver() {
    clearInterval(timerInterval); // Geri sayımı tamamen durdur
    isProcessing = true; // Tahtayı tamamen kilitle ki oyun oynanmasın

    if (game.in_checkmate()) {
        if (bossText) {
            bossText.innerText = playerTurn ? "ŞAH MAT. Zayıf zihnin buraya kadarmış." : "ŞAH MAT... Sisteme nasıl sızdın?";
        }
    } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        if (bossText) bossText.innerText = "Berabere. İkimiz de sonsuz bir döngüde sıkıştık.";
    }
}

// --- 11. STOCKFISH API ENTEGRASYONU ---
async function triggerStockfishAI() {
    // Eğer hamlenle oyunu zaten bitirdiysen AI'yi yorma
    if (game.game_over()) { 
        handleGameOver();
        return; 
    }
    
    const fen = game.fen(); // Tahtanın o anki fiziksel haritasını şifrele
    const depth = 10; // Zorluk seviyesi (10 = Hızlı ama oldukça acımasız)

    try {
        // Dünyanın en güçlü satranç motorunun sunucusuna veri yolla
        const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);
        const data = await response.json();
        
        if (data.success) {
            // API bize "bestmove e7e5 ponder g1f3" gibi bir metin döner. Bize sadece "e7e5" kısmı lazım.
            const bestMoveStr = data.bestmove.split(" ")[1]; 
            
            // Hamleyi bizim tahtanın anlayacağı formata çevir
            const moveObj = {
                from: bestMoveStr.substring(0, 2),
                to: bestMoveStr.substring(2, 4),
                promotion: bestMoveStr.length > 4 ? bestMoveStr.substring(4, 5) : 'q'
            };
            
            game.move(moveObj); // Hamleyi motor üzerinde gerçekleştir
            board.position(game.fen()); // Ekrandaki tahtayı fiziksel olarak güncelle
            
            triggerBossPersona(); // Boss sana laf soksun
            
            playerTurn = true; // Sırayı tekrar sana ver
            isProcessing = false; // Sistemin tıklama kilidini aç
            startTimer(); // Senin ölüm saatini başlat
            
            // Eğer Boss'un bu efsanevi hamlesi seni mat ettiyse oyunu bitir
            if (game.game_over()) handleGameOver();
        } else {
            throw new Error("API yanıtı geçersiz.");
        }
    } catch (error) {
        console.error("[VOIDZA SYS] Stockfish Ağına ulaşılamadı:", error);
        triggerBossPersona(true); // Hata mesajı ile laf sok
        
        // Eğer sunucu çökerse oyun kilitlenmesin diye YEDEK PLAN: Motor rastgele geçerli bir hamle yapsın
        const moves = game.moves();
        if (moves.length > 0) {
            game.move(moves[Math.floor(Math.random() * moves.length)]);
            board.position(game.fen());
            
            playerTurn = true;
            isProcessing = false;
            startTimer();
            
            if (game.game_over()) handleGameOver();
        }
    }
}

// ==========================================
// PART 4 SONU
// ==========================================
// ==========================================
// BÖLÜM 5: SİSTEM ATEŞLEMESİ (BOOT SEQUENCE)
// ==========================================

console.log("[VOIDZA SYS] Tüm modüller devrede. Tahta fiziksel olarak oluşturuluyor...");

// --- 12. TAHTA KONFİGÜRASYONU VE BAŞLATMA ---
// Sürüklemeyi (draggable) tamamen kapatıyoruz çünkü kendi Click-to-Move sistemimizi yazdık.
const config = {
    draggable: false, 
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

// Tahtayı HTML içindeki 'myBoard' div'ine şanlı bir şekilde çiziyoruz
board = Chessboard('myBoard', config);

// Saatleri başlangıç değerleri ile (10:00) ekrana bas
updateClocks();

// Zamanlayıcıyı tetikle ve oyunu resmi olarak başlat!
startTimer();

console.log("[VOIDZA SYS] Sistem tam operasyonel. The Architect seni bekliyor.");
// ==========================================
// THE VOIDZA CORE ENGINE - TÜM KODLARIN SONU
// ==========================================

                    


