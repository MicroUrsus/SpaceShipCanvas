'use strict;'
window.onload = function () {

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    const canvas = document.getElementById('canvas');
    let ship = {
        width: 95,
        height: 151,
        frames: 11,
        x: 950,
        y: 900,
        speed_x: 0,
        speed_y: 0,
        speed_v: 5,
        model: new Image(),
        bullet: new Image(),
        flame_main: new Image()
    };

    let move_yes = false;
    let direction_l;
    let direction_r;
    let direction_u;
    let direction_d;
    let currentFrame = 6;
    let context = canvas.getContext("2d");
    let player_shot = [];
    let particles = [];
    let aliens = [];


    ship.model.src = 'img/fighter_all.png';
    ship.bullet.src = 'img/shot_base.png';
    ship.flame_main.src = 'img/flame_main.png';


    function loop() {
        window.requestAnimFrame(loop);
        CreateParticles();
        UpdateParticles();
        DrawParticles();

        Collisions();

        CreateAlien();
        UpdateAliens();
        DrawAliens();

        UpdatePlayerBullets();
        DrawPlayerShot();

        DrawShip();


    }

    window.requestAnimFrame(loop);

    function Collisions() {
        for (let i in player_shot) {
            let bullet = player_shot[i];
            for (let a in aliens) {
                let enemy = aliens[a];

                if (DTP(bullet, enemy)) {
                    bullet.state = "hit";
                    enemy.heal--;
                    if (enemy.heal == 0) {
                        enemy.state = "hit";
                    }
                }


            }
        }
        for (let i in aliens) {
            let enemy = aliens[i];
            if (DTP(ship, enemy)) {
                enemy.state = "hit";
            }
        }
    }

    function DTP(a, b) {
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {
            if (b.y + b.height >= a.y + a.y / 10 && b.y < a.y + a.height) {
                return true;
            }
        }
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
            if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
                return true;
            }
        }
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
                return true;
            }
        }
        return false;
    }

    function ExplosionEnemy(enemy) {
        let frame = 34;
        if (enemy.explos > frame)
            return enemy.state = 'dead';
        enemy.alien_img.src = `img/explosive.png`;
        context.drawImage(
            enemy.alien_img,
            enemy.counter, enemy.counter_ex, 100, 100,
            enemy.x, enemy.y, 100, 100
        );
        if (enemy.counter <= 500) {
            enemy.counter += 100;
        } else {
            enemy.counter = 0;
            enemy.counter_ex += 100;
        }
        enemy.explos++;
    }


    function DrawShip() {
        if (move_yes) {
            if (direction_l && ship.x >= 0) {
                ship.x += -ship.speed_v;
                if (currentFrame >= 1) currentFrame--;
            }
            if (direction_r && ship.x + ship.width <= canvas.width) {
                ship.x += ship.speed_v;
                if (currentFrame < 10) currentFrame++;
            }
            if (direction_u && ship.y >= canvas.height / 3) {
                ship.y += -ship.speed_v;
            }
            if (direction_d && ship.y + ship.height <= canvas.height - 50) {
                ship.y += ship.speed_v;
            }
        }
        context.drawImage(
            ship.model,
            ship.width * currentFrame, 0, ship.width, ship.height,
            ship.x, ship.y, ship.width, ship.height
        );
        FlameMain();
    }

    function DrawPlayerShot() {
        for (let i in player_shot) {
            let bullet = player_shot[i];
            if (bullet.state != 'hit') {
                context.drawImage(
                    ship.bullet,
                    0, 0, 95, 95,
                    bullet.x, bullet.y, bullet.width, bullet.height
                );
            } else {
                player_shot.splice(i, 1);
            }
        }
    }

    function UpdatePlayerBullets() {
        for (let i in player_shot) {
            let bullet = player_shot[i];
            bullet.y -= 8;
            bullet.counter++;
        }
        player_shot = player_shot.filter(function (bullet) {
            return bullet.y > 0;
        });
    }

    function FirePlayer() {
        // создаём новую пулю
        player_shot.push({
            x: ship.x,
            y: ship.y - 5,
            width: 95,
            height: 95,
            counter: 0,
        });
    }


    function FlameMain() {
        let width = 34;
        let height = 68;
        let x = ship.x + ship.width / 2 - width / 2.25;
        let y = ship.y + ship.height - 15;
        let frame = Math.round(Math.random() * 7);
        context.drawImage(
            ship.flame_main,
            width * frame, 0, width, height,
            x, y, width, height
        );
    }

    function CreateAlien() {
        // создаём пришельца
        let width;
        let heigt;
        let speed = Math.round(1 + Math.random() * 5);
        let x = Math.random() * canvas.width;
        let enemy_num = Math.round(1 + Math.random() * 5);
        if (aliens.length <= 6) {
            switch (enemy_num) {
                case 1:
                case 2:
                    width = 116;
                    heigt = 110;
                    heal = 1;
                    break;
                case 3:
                case 4:
                    width = 124;
                    heigt = 135;
                    heal = 2;
                    break;
                case 5:
                case 6:
                    width = 168;
                    heigt = 104;
                    heal = 3;
                    break;

                default:
                    break;
            }
        }

        if (x > canvas.width - width) x = canvas.width - width;

        
        aliens.push({
            x: x,
            y: 5,
            heal: heal,
            width: width,
            height: heigt,
            counter: 0,
            counter_ex: 0,
            speed: speed,
            alien_img: new Image(),
            model: `img/enemy/enemy_${enemy_num}.png`,
            state: 'alive',
            explos: 1
        });
    }

    function DrawAliens() {
        for (let i in aliens) {
            let enemy = aliens[i];
            if (enemy.state == 'alive') {
                enemy.alien_img.src = enemy.model;
                context.drawImage(
                    enemy.alien_img,
                    0, 0, enemy.width, enemy.height,
                    enemy.x, enemy.y, enemy.width, enemy.height
                );
            }
            if (enemy.state == 'hit') {
                ExplosionEnemy(enemy);
                //aliens.splice(i, 1);
            }
            if (enemy.state == 'dead') {
                aliens.splice(i, 1);
            }
        }
    }


    function UpdateAliens() {
        for (let i in aliens) {
            let enemy = aliens[i];
            enemy.y += enemy.speed;
            if (enemy.y > canvas.height) {
                aliens.splice(i, 1);
            }
        }
    }


    function CreateParticles() {
        color_arr = ['#ffffff', '#f7ff94', '#c6ffe9', '#ffddfc', '#cdffe0'];
        if (particles.length < 100) {
            particles.push({
                x: Math.random() * canvas.width,
                y: 0,
                speed: 2 + Math.random() * 3,
                radius: 0.5 + Math.random() * 2,
                color: color_arr[Math.round(Math.random() * 4)]
            });
        }
    }

    function UpdateParticles() {
        for (let i in particles) {
            let part = particles[i];
            part.y += part.speed;
            if (part.y > canvas.height) {
                part.y = 0;
            }
        }
    }

    function DrawParticles() {
        let c = canvas.getContext('2d');
        let galaxy_1 = new Image();
        let galaxy_2 = new Image();
        let galaxy_3 = new Image();

        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);
        galaxy_1.src = 'img/Nebula1.png';
        galaxy_2.src = 'img/Nebula2.png';
        galaxy_3.src = 'img/Nebula3.png';
        c.drawImage(galaxy_1, 50, 450);
        c.drawImage(galaxy_2, 900, 50);
        c.drawImage(galaxy_3, 500, 50);
        c.drawImage(galaxy_3, 50, 50);
        c.drawImage(galaxy_1, 1200, 450);


        for (let i in particles) {
            let part = particles[i];
            c.beginPath();
            c.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
            c.closePath();
            c.fillStyle = part.color;
            c.fill();
        }
    }


    window.document.addEventListener('keydown', function (event) {
        //console.log(event.keyCode);
        switch (event.keyCode) {
            case 37 : //влево
                direction_l = true;
                break;
            case 38 : // вверх
                direction_u = true;
                break;
            case 39 : // вправо
                direction_r = true;
                break;
            case 40 :
                direction_d = true;
                break;
            case 32 :
                FirePlayer();
                break;
            default:
                break;
        }
        move_yes = true;
    });

    window.document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 37 : //влево
                direction_l = false;
                break;
            case 38 : // вверх
                direction_u = false;
                break;
            case 39 : // вправо
                direction_r = false;
                break;
            case 40 :
                direction_d = false;
                break;
            default:
                break;
        }
        currentFrame = 6;
        move_yes = false;
    });
}
;
