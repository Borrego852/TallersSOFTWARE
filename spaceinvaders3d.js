// Space Invaders 3D básico con nave y alas animadas
// Requiere Three.js (incluido en el HTML)

let scene, camera, renderer;
let ship, leftWing, rightWing;
let shipSpeed = 0;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let lastEnemyShot = 0;
let lives = 3;
let barrier;
let barrierHP = 12;
const infoDiv = document.getElementById('info');
let enemyDownTimer = 0;
let score = 0;

const shipMaxX = 20;
const shipMinX = -20;
const shipY = -12;
const shipZ = 0;

// Ajuste de cámara y posición para visibilidad
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 30); // Aleja la cámara para ver todo

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luz
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(0, 10, 10);
    scene.add(dir);

    // Suelo
    const floorGeo = new THREE.PlaneGeometry(30, 1);
    const floorMat = new THREE.MeshPhongMaterial({color:0x222244});
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = shipY - 1;
    scene.add(floor);

    // Nave principal (cuerpo, tamaño original de la instrucción 3)
    const bodyGeo = new THREE.BoxGeometry(1.1, 0.4, 0.6);
    const bodyMat = new THREE.MeshPhongMaterial({color:0x00ffcc});
    ship = new THREE.Mesh(bodyGeo, bodyMat);
    ship.position.set(0, shipY, shipZ);
    scene.add(ship);

    // Alas
    const wingGeo = new THREE.BoxGeometry(0.55, 0.12, 0.42);
    const wingMat = new THREE.MeshPhongMaterial({color:0xff4444});
    leftWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.66, shipY, shipZ);
    rightWing.position.set(0.66, shipY, shipZ);
    scene.add(leftWing);
    scene.add(rightWing);

    // Enemigos (tres filas, separados y tamaño original de la instrucción 3)
    for(let row=0; row<3; row++) {
        for(let i=-24; i<=24; i+=12) {
            const invGeo = new THREE.BoxGeometry(1.52, 1.06, 1.52);
            const invMat = new THREE.MeshPhongMaterial({color:0xffff00});
            const inv = new THREE.Mesh(invGeo, invMat);
            inv.position.set(i, 28-row*5.2, 0);
            scene.add(inv);
            enemies.push(inv);
        }
    }
    // Barrera defensiva
    const barrGeo = new THREE.BoxGeometry(4, 0.7, 1.2);
    const barrMat = new THREE.MeshPhongMaterial({color:0x00ff00});
    barrier = new THREE.Mesh(barrGeo, barrMat);
    barrier.position.set(0, shipY+2.5, 0);
    scene.add(barrier);

    // Eventos teclado
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    updateInfo();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
    if (e.key === 'ArrowLeft') shipSpeed = -0.3;
    if (e.key === 'ArrowRight') shipSpeed = 0.3;
    if (e.key === ' ' || e.key === 'Spacebar') shoot();
}

function onKeyUp(e) {
    if (e.key === 'ArrowLeft' && shipSpeed < 0) shipSpeed = 0;
    if (e.key === 'ArrowRight' && shipSpeed > 0) shipSpeed = 0;
}

function shoot() {
    // Disparo jugador (más grande)
    const bulletGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const bulletMat = new THREE.MeshPhongMaterial({color:0x00ffff});
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    bullet.position.set(ship.position.x, shipY+0.7, 0);
    scene.add(bullet);
    playerBullets.push(bullet);
}

function animate() {
    requestAnimationFrame(animate);
    // Mover nave
    ship.position.x += shipSpeed;
    if (ship.position.x < shipMinX) ship.position.x = shipMinX;
    if (ship.position.x > shipMaxX) ship.position.x = shipMaxX;
    // Mover alas con animación
    const wingAngle = shipSpeed * 2;
    leftWing.position.x = ship.position.x - 0.38;
    rightWing.position.x = ship.position.x + 0.38;
    leftWing.rotation.z = wingAngle;
    rightWing.rotation.z = -wingAngle;
    // Enemigos bajan más rápido
    if (enemies.length) {
        if (Date.now() - enemyDownTimer > 600) {
            for (let e of enemies) e.position.y -= 0.18;
            enemyDownTimer = Date.now();
        }
    }
    // Disparos jugador
    for (let i = playerBullets.length-1; i >= 0; i--) {
        const b = playerBullets[i];
        b.position.y += 0.45;
        // Colisión con enemigos
        for (let j = enemies.length-1; j >= 0; j--) {
            if (b.position.distanceTo(enemies[j].position) < 0.9) {
                scene.remove(enemies[j]);
                enemies.splice(j,1);
                scene.remove(b);
                playerBullets.splice(i,1);
                score += 100;
                updateInfo();
                break;
            }
        }
        // Colisión con barrera
        if (b && barrier && b.position.distanceTo(barrier.position) < 2.2) {
            barrierHP--;
            scene.remove(b);
            playerBullets.splice(i,1);
            if (barrierHP <= 8 && barrierHP > 4) barrier.material.color.set(0xffff00);
            if (barrierHP <= 4 && barrierHP > 0) barrier.material.color.set(0xff6600);
            if (barrierHP <= 0) {
                scene.remove(barrier);
                barrier = null;
            }
            continue;
        }
        // Fuera de pantalla
        if (b && b.position.y > 16) {
            scene.remove(b);
            playerBullets.splice(i,1);
        }
    }
    // Disparos enemigos
    for (let i = enemyBullets.length-1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.position.y -= 0.32;
        // Colisión con barrera
        if (barrier && b.position.distanceTo(barrier.position) < 2.2) {
            barrierHP--;
            scene.remove(b);
            enemyBullets.splice(i,1);
            if (barrierHP <= 8 && barrierHP > 4) barrier.material.color.set(0xffff00);
            if (barrierHP <= 4 && barrierHP > 0) barrier.material.color.set(0xff6600);
            if (barrierHP <= 0) {
                scene.remove(barrier);
                barrier = null;
            }
            continue;
        }
        // Colisión con nave
        if (b.position.distanceTo(ship.position) < 1.2) {
            lives--;
            updateInfo();
            scene.remove(b);
            enemyBullets.splice(i,1);
            if (lives <= 0) {
                infoDiv.textContent = '¡Game Over! Recarga para jugar de nuevo';
                ship.visible = false;
                leftWing.visible = false;
                rightWing.visible = false;
            }
            continue;
        }
        // Fuera de pantalla
        if (b.position.y < -10) {
            scene.remove(b);
            enemyBullets.splice(i,1);
        }
    }
    // Disparos enemigos automáticos (cada 0.60s, más grandes)
    if (enemies.length && Date.now() - lastEnemyShot > 600) {
        lastEnemyShot = Date.now();
        const shooter = enemies[Math.floor(Math.random()*enemies.length)];
        const bulletGeo = new THREE.SphereGeometry(0.32, 12, 12);
        const bulletMat = new THREE.MeshPhongMaterial({color:0xff2222});
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.position.set(shooter.position.x, shooter.position.y-0.7, 0);
        scene.add(bullet);
        enemyBullets.push(bullet);
    }
    // Render
    renderer.render(scene, camera);
}

function updateInfo() {
    infoDiv.textContent = `Vidas: ${lives} | Score: ${score} | Usa las flechas ← → para mover la nave y espacio para disparar`;
}
