const questions = [
    {
        q: "¿Cuál es tu color favorito?",
        options: ["Azul", "Rojo", "Verde", "Negro"]
    },
    {
        q: "¿Qué actividad prefieres?",
        options: ["Leer", "Jugar videojuegos", "Deporte", "Dibujar"]
    },
    {
        q: "¿Qué animal te representa más?",
        options: ["Lobo", "Gato", "Águila", "Delfín"]
    },
    {
        q: "¿Qué clima prefieres?",
        options: ["Lluvioso", "Soleado", "Nublado", "Nevado"]
    },
    {
        q: "¿Qué género musical te gusta más?",
        options: ["Rock", "Pop", "Clásica", "Electrónica"]
    },
    {
        q: "¿Qué superpoder elegirías?",
        options: ["Volar", "Invisibilidad", "Superfuerza", "Telepatía"]
    },
    {
        q: "¿Qué comida prefieres?",
        options: ["Pizza", "Sushi", "Hamburguesa", "Ensalada"]
    },
    {
        q: "¿Qué te motiva más?",
        options: ["Logros", "Diversión", "Amistad", "Conocimiento"]
    },
    {
        q: "¿Qué lugar te gustaría visitar?",
        options: ["Montañas", "Playa", "Ciudad", "Bosque"]
    },
    {
        q: "¿Cómo te describirías?",
        options: ["Creativo/a", "Analítico/a", "Aventurero/a", "Tranquilo/a"]
    }
];

const results = [
    {
        name: "Lobo",
        desc: "¡Eres un Lobo! Aventurero, curioso y siempre listo para nuevos retos digitales.",
        img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Gato",
        desc: "¡Eres un Gato! Amistoso, adaptable y con un gran espíritu de equipo.",
        img: "https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Águila",
        desc: "¡Eres un Águila! Cuidadoso, nostálgico y con mucho cariño por los detalles.",
        img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Delfín",
        desc: "¡Eres un Delfín! Creativo, divertido y siempre buscando nuevas aventuras en línea.",
        img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Kojima",
        desc: "¡Eres Hideo Kojima! Visionario, creativo y un verdadero genio de los videojuegos. ¡Tu animal espiritual es Kojima!",
        img: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Hideo_Kojima_GDC_2019_%28cropped%29.jpg"
    }
];

let current = 0;
let answers = [];

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const resultEl = document.getElementById('result');

function renderQuestion() {
    const q = questions[current];
    questionEl.textContent = `Pregunta ${current + 1}/10: ${q.q}`;
    optionsEl.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[current] = idx;
            nextBtn.disabled = false;
        };
        optionsEl.appendChild(btn);
    });
    nextBtn.disabled = answers[current] === undefined;
    progressBar.style.width = `${((current) / questions.length) * 100}%`;
}

nextBtn.onclick = () => {
    if (answers[current] === undefined) return;
    current++;
    if (current < questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
};

function showResult() {
    // Si eliges Leer (1), Creativo/a (9) y Volar (5) eres Kojima
    const isKojima = answers[1] === 0 && answers[9] === 0 && answers[5] === 0;
    let idx;
    if (isKojima) {
        idx = 4;
    } else {
        // Suma las respuestas para elegir resultado (simple)
        const sum = answers.reduce((a, b) => a + b, 0);
        idx = sum % 4;
    }
    const res = results[idx];
    resultEl.innerHTML = `
        <img src="${res.img}" alt="${res.name}" class="result-img">
        <h2>${res.name}</h2>
        <p>${res.desc}</p>
        <div class="result-actions">
            <button id="repeat-btn">Repetir</button>
            <button id="share-btn">Compartir</button>
            <button id="download-btn">Descargar</button>
        </div>
    `;
    resultEl.style.display = 'block';
    document.getElementById('question-container').style.display = 'none';
    nextBtn.style.display = 'none';
    progressBar.style.width = '100%';

    if (idx === 4) {
        lanzarConfeti();
    }

    document.getElementById('repeat-btn').onclick = () => {
        current = 0;
        answers = [];
        resultEl.style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
        nextBtn.style.display = 'inline-block';
        renderQuestion();
    };
    document.getElementById('share-btn').onclick = () => {
        const shareText = `¡Soy un ${res.name}! ${res.desc}`;
        if (navigator.share) {
            navigator.share({ title: '¿Qué criatura digital eres?', text: shareText, url: window.location.href });
        } else {
            navigator.clipboard.writeText(shareText + ' ' + window.location.href);
            alert('¡Enlace copiado para compartir!');
        }
    };
    document.getElementById('download-btn').onclick = () => {
        const text = `Resultado del test: ${res.name}\n${res.desc}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'resultado-test.txt';
        a.click();
    };
}

// Confeti para Kojima
function lanzarConfeti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#f7e018', '#e94f37', '#393e46', '#00adb5']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f7e018', '#e94f37', '#393e46', '#00adb5']
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

// Inicializar
renderQuestion();

document.getElementById('toggle-mode-btn').onclick = function() {
    document.body.classList.toggle('dark-mode');
    this.textContent = document.body.classList.contains('dark-mode') ? 'Modo claro' : 'Modo oscuro';
};
