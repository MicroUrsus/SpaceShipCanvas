'use strict;'
window.onload = function () {

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setInterval(callback, 1000 / 60);
            };
    })();

    const canvas = document.getElementById('canvas');
    let ship = {
        heal: 5,
        weapon: 'base',
        shot_model: '',

        width: 55,
        height: 150,
        frames: 11,
        x: 950,
        y: 900,

        speed_x: 0,
        speed_y: 0,
        speed_v: 5,

        model: new Image(),
        bullet: new Image(),
        flame_main: new Image(),
        flame_slip: new Image(),
        flame_back_l: new Image(),
        flame_back_r: new Image(),

        score_player: 0,
        life: 5,
    };

    let move_yes = false;
    let direction_l;
    let direction_r;
    let direction_u;
    let direction_d;
    let currentFrame = 6;
    let context = canvas.getContext("2d");
    let player_shot = [];
    let enemy_shot = [];
    let particles = [];
    let aliens = [];
    let boss_counter = 0;
    let boss_coming = false;
    let stop_add_enemy = false;

    let galaxies = [];
    let galaxies_create_stop = false;
    let galaxies_counter = 0;

    let fire_ready = true;


    ship.model.src = 'img/fighter_all.png';
    ship.bullet.src = `img/shot_${ship.shot_model}.png`;
    ship.flame_main.src = 'img/flame_main.png';
    //ship.flame_back_l.src = 'img/flame_rev_left.png';
    //ship.flame_back_r.src = 'img/flame_rev_right.png';

    for (let i = 0; i < 4; i++) {
        CreateGalaxy (Math.random() * canvas.height);
    }


    function loop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        CreateParticles();
        UpdateParticles();
        DrawParticles();


        if (!galaxies_create_stop) CreateGalaxy();
        galaxies_create_stop = (galaxies.length >= 5) ? true : false;
        galaxies_counter++;

        DrawGalaxy();
        UpdateGalaxy();

        Collisions();
        stop_add_enemy = (boss_counter >= 5) ? true : false;

        CreateAlien();
        UpdateAliens();
        DrawAliens();

        UpdatePlayerBullets();
        DrawPlayerShot();

        UpdateEnemyBullets();
        DrawEnemyShot();

        DrawShip();
        window.requestAnimFrame(loop);


        InfoPlay()
    }

    window.requestAnimFrame(loop);


    function InfoPlay() {
        let text_life = `Life : ${ship.life}`;
        let text_score = `Score player : ${ship.score_player}`;
        let text_weapon = `Weapon ( Q | E ) : ${ship.weapon}`;

        context = canvas.getContext("2d");
        context.fillStyle = "#56ff00";
        context.fillStroke = "#ff6c0d";
        context.font = "italic 50px Arial";
        context.fillText(text_weapon, 50 , 50);
        context.fillText(text_life, canvas.width / 3.5 , 50);
        context.fillText(text_score, canvas.width / 2 + 100, 50);
    }

    function DrawShip() {
        if (move_yes) {
            if (direction_l && ship.x >= 0) {
                ship.x += -ship.speed_v;
                if (currentFrame >= 1) currentFrame--;
                if (!direction_d) FlameSlip('r');
            }
            if (direction_r && ship.x + ship.width <= canvas.width) {
                ship.x += ship.speed_v;
                if (currentFrame < 10) currentFrame++;
                if (!direction_d) FlameSlip('l');
            }
            if (direction_u && ship.y >= canvas.height / 3) {
                ship.y += -ship.speed_v;

            }
            if (direction_d && ship.y + ship.height <= canvas.height - 50) {
                ship.y += ship.speed_v;
                if (direction_l) FlameRevers('r');
                if (direction_r) FlameRevers('l');
                if (!direction_r && !direction_l) FlameRevers('all');
            }
        }
        context.drawImage(
            ship.model,
            ship.width * currentFrame, 0, ship.width, ship.height,
            ship.x, ship.y, ship.width, ship.height
        );
        if (!direction_d) FlameMain();
    }

    function FlameMain() {
        let width = 34;
        let height = 68;
        let x = ship.x + ship.width / 2 - width / 2;
        let y = ship.y + ship.height - 15;
        let frame = Math.round(Math.random() * 7);
        context.drawImage(
            ship.flame_main,
            width * frame, 0, width, height,
            x, y, width, height
        );
    }

    function FlameSlip(side) {
        let width = 30;
        let height = 30;
        let x;
        let y = ship.y + ship.height / 4;
        let frame = Math.round(Math.random() * 7);

        switch (side) {
            case 'l':
                x = ship.x - 10;
                ship.flame_slip.src = 'img/flame_left.png';
                break;
            case 'r':
                x = ship.x + 35;
                ship.flame_slip.src = 'img/flame_right.png';
                break;
            default:
                break;
        }

        context.drawImage(
            ship.flame_slip,
            width * frame, 0, width, height,
            x, y, width, height
        );
    }

    function FlameRevers(side) {
        let width = 16;
        let height = 50;
        let x;
        let y;
        let frame = Math.round(Math.random() * 7);

        switch (side) {
            case 'l':
                width = 40;
                height = 40;
                ship.flame_back_l.src = 'img/flame_rev_left.png';
                x = ship.x - 30;
                y = ship.y + ship.height / 2.5;
                context.drawImage(
                    ship.flame_back_l,
                    width * frame, 0, width, height,
                    x, y, width, height
                );
                break;
            case 'r':
                width = 40;
                height = 40;
                ship.flame_back_r.src = 'img/flame_rev_right.png';
                x = ship.x + ship.width - 10;
                y = ship.y + ship.height / 2.5;
                context.drawImage(
                    ship.flame_back_r,
                    width * frame, 0, width, height,
                    x, y, width, height
                );
                break;
            case 'all':
                ship.flame_back_r.src = 'img/flame_rev.png';
                ship.flame_back_l.src = 'img/flame_rev.png';
                x = ship.x - 5;
                y = ship.y + ship.height / 3;
                context.drawImage(
                    ship.flame_back_l,
                    width * frame, 0, width, height,
                    x, y, width, height
                );
                x = ship.x + ship.width - 10;
                context.drawImage(
                    ship.flame_back_r,
                    width * frame, 0, width, height,
                    x, y, width, height
                );
                break;

            default:
                break;
        }

    }


    function FirePlayer() {
        // создаём новую пулю
        switch (ship.weapon) {
            case 'base':
                ship.shot_model = 'base';
                break;
            case 'freez':
                ship.shot_model = 'freez';
                break;
            default:
                break;
        }
        if (fire_ready) {
            player_shot.push({
                x: ship.x - 20,
                y: ship.y - 5,
                width: 95,
                height: 95,
                counter: 0,
                type: ship.weapon,
                shot: `img/shot_${ship.shot_model}.png`,
            });
            fire_ready = false;
        }
        ReloadWeapon(2000);
    }

    function DrawPlayerShot() {
        for (let i in player_shot) {
            let bullet = player_shot[i];
            ship.bullet.src = bullet.shot;
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


    function Collisions() {
        for (let i in player_shot) {
            let bullet = player_shot[i];
            for (let a in aliens) {
                let enemy = aliens[a];

                if (DTP(bullet, enemy)) {
                    bullet.state = "hit";
                    TargetHit(enemy, bullet);
                }
            }
        }
        for (let i in aliens) {
            let enemy = aliens[i];
            if (DTP(ship, enemy)) {
                enemy.state = "hit";
            }
        }

        for (let i in enemy_shot) {
            let enemy_bullet = enemy_shot[i];
            if (DTP(enemy_bullet, ship)) {
                enemy_bullet.state = "hit";
                if (typeof ship.life == 'number') ship.life--;
                if (ship.life <= 0 ) ship.life = `temporarily immortal`
                //TargetHit(enemy, bullet);
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

    function TargetHit(target, weapon) {
        switch (weapon.type) {
            case 'base' :
                target.heal--;
                if (target.heal == 0) {
                    target.state = "hit";
                    ship.score_player += target.price;
                    boss_counter++;
                }
                break;
            case 'freez' :
                if (target.state != 'freez') {
                    target.speed = 0;
                    setTimeout(function () {
                        target.speed = target.base_speed;
                        target.state = 'alive';
                    }, 3000);
                }
                break;
            default :
                break;
        }
    }

    function ExplosionEnemy(enemy) {
        let frame = 34;
        if (enemy.explos > frame)
            return enemy.state = 'dead';
        enemy.alien_img.src = `img/explosive.png`;
        context.drawImage(
            enemy.alien_img,
            enemy.counter, enemy.counter_ex, 100, 100,
            enemy.x + enemy.width / 2 - 50, enemy.y + enemy.height / 2 - 50, 100, 100
        );
        if (enemy.counter <= 500) {
            enemy.counter += 100;
        } else {
            enemy.counter = 0;
            enemy.counter_ex += 100;
        }
        enemy.width = 100;
        enemy.height = 100;
        enemy.explos++;
    }

    function ReloadWeapon(reload = 1500) {
        setInterval(function () {
            fire_ready = true;
        }, reload)

    }


    function CreateAlien() {
        // создаём пришельца
        let type = 'imp';
        let width;
        let height;
        let heal;
        let price;
        let arms;
        let fire_rate;
        let base_speed = Math.round(1 + Math.random() * 5);
        let slip = 0;
        let x = Math.random() * canvas.width;
        let enemy_num = (!stop_add_enemy) ? Math.round(1 + Math.random() * 5) : 666;

        if (aliens.length < 6) {

            switch (enemy_num) {
                case 1:
                case 2:
                    width = 116;
                    height = 110;
                    heal = 1;
                    arms = 1;
                    fire_rate = 25;
                    price = 100;
                    break;
                case 3:
                case 4:
                    width = 124;
                    height = 135;
                    heal = 2;
                    arms = 2;
                    fire_rate = 35;
                    price = 200;
                    break;
                case 5:
                case 6:
                    width = 168;
                    height = 104;
                    heal = 3;
                    arms = 3;
                    fire_rate = 50;
                    price = 300;
                    break;

                case 666:
                    if (!boss_coming) {
                        width = 512;
                        height = 346;
                        heal = 100;
                        boss_coming = true;
                        base_speed = 0;
                        slip = -2;
                        type = 'boss';
                        price = 1000;
                    }
                    break;

                default:
                    break;
            }

            if (x < canvas.width - width)
                aliens.push({
                    x: x,
                    y: 5,
                    heal: heal,
                    width: width,
                    height: height,
                    counter: 0,
                    counter_ex: 0,
                    speed: base_speed,
                    base_speed: base_speed,
                    slip: slip,
                    alien_img: new Image(),
                    model: `img/enemy/enemy_${enemy_num}.png`,
                    state: 'alive',
                    explos: 1,
                    type: type,
                    arms: arms,
                    fire: fire_rate,
                    price: price,
                    weapon: new Image(),
                });
        }
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
                if (enemy.type == 'boss') {
                    boss_counter = 0;
                    boss_coming = false;
                }
            }
            if (enemy.state == 'freez') {
                context.drawImage(
                    enemy.alien_img,
                    0, 0, enemy.width, enemy.height,
                    enemy.x, enemy.y, enemy.width, enemy.height
                );
            }
        }
    }

    function UpdateAliens() {
        for (let i in aliens) {
            let enemy = aliens[i];
            enemy.y += enemy.speed;
            enemy.x += enemy.slip;

            if (enemy.state == 'alive')
                FireEnemy(enemy);

            if (enemy.y > canvas.height) {
                aliens.splice(i, 1);
            }
            if (enemy.x <= -enemy.width ||
                enemy.x >= canvas.width + enemy.width) {
                enemy.slip = -enemy.slip;
            }
            if (enemy.slip < 0) {
                enemy.model = `img/enemy/enemy_666.png`
            }
            if (enemy.slip > 0) {
                enemy.model = `img/enemy/enemy_666_r.png`
            }
        }
    }

    function FireEnemy(enemy) {
        let shot;
        let width;
        let height;

        switch (enemy.arms) {
            case 1:
                width = 35;
                height = 25;
                shot = `img/enemy/enemy_shot1.png`;
                break;
            case 2:
                width = 114;
                height = 68;
                shot = `img/enemy/enemy_shot4.png`;
                break;
            case 3:
                width = 55;
                height = 180;
                shot = `img/enemy/enemy_shot3.png`;
                break;

            default:
                width = 25;
                height = 50;
                shot = `img/enemy/enemy_shot.png`;
                break;
        }

        let fire = Math.round(Math.random() * enemy.fire);
        if (fire == enemy.fire && enemy.state != 'freez') {
            enemy_shot.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height - 5,
                speed: enemy.speed + 2,
                width: width,
                height: height,
                counter: 0,
                //type: base,
                shot: shot,
                bullet: new Image(),
            });
        }
    }

    function DrawEnemyShot() {
        if (enemy_shot.length != 0) {
            for (let i in enemy_shot) {
                let enemy_bullet = enemy_shot[i];
                enemy_bullet.bullet.src = enemy_bullet.shot;
                if (enemy_bullet.state != 'hit') {
                    context.drawImage(
                        enemy_bullet.bullet,
                        0, 0, enemy_bullet.width, enemy_bullet.height,
                        enemy_bullet.x - enemy_bullet.width / 2, enemy_bullet.y, enemy_bullet.width, enemy_bullet.height
                    );
                } else {
                    enemy_shot.splice(i, 1);
                }
            }
        }
    }

    function UpdateEnemyBullets() {
        if (enemy_shot.length != 0) {
            for (let i in enemy_shot) {
                let enemy_bullet = enemy_shot[i];
                enemy_bullet.y += enemy_bullet.speed + 8;
                enemy_bullet.counter++;

                if (enemy_bullet.y > canvas.height) {
                    enemy_shot.splice(i, 1);
                }
            }
            enemy_bullet = enemy_shot.filter(function (bullet) {
                return bullet.y > 0;
            });
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

    function CreateGalaxy(start = -700) {
        let galaxy_x = Math.round(1 + Math.random() * ( canvas.width - 200));
        let galaxy_y = start;
        let galaxy_pic = Math.round(1 + Math.random() * 2);
        galaxies.push({
            x: galaxy_x,
            y: galaxy_y,
            galaxy_img: new Image(),
            model: `img/Nebula${galaxy_pic}.png`,
        });

        //console.log(galaxies);
    }

    function DrawGalaxy() {
        let c = canvas.getContext('2d');
        for (let galaxy of galaxies) {
            galaxy.galaxy_img.src = galaxy.model;
            c.drawImage(galaxy.galaxy_img, galaxy.x, galaxy.y);
        }
    }

    function UpdateGalaxy() {
        let moving_stars_step = .1;
        for (let i in galaxies) {
            let galaxy = galaxies [i];
            galaxy.y += moving_stars_step;
            if (galaxies_counter > 200 && galaxies.length<=15) {
                galaxies_create_stop = false;
                galaxies_counter = 0;
            }

            if (galaxy.y > canvas.height) {
                galaxies.splice(i, 1);
            }
        }
    }


    function DrawParticles() {
        let c = canvas.getContext('2d');
        c.fillStyle = "black";

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
            case 65 : //влево
            case 37 : //влево
                direction_l = true;
                break;
            case 87 : // вверх
            case 38 : // вверх
                direction_u = true;
                break;
            case 68 :
            case 39 : // вправо
                direction_r = true;
                break;
            case 83 :
            case 40 :
                direction_d = true;
                break;
            case 32 :
                if (fire_ready) {
                    FirePlayer();
                }
                break;
            case 81 :
                ship.weapon = 'base';
                break;
            case 69 :
                ship.weapon = 'freez';
                break;
            default:
                break;
        }
        move_yes = true;
    });

    window.document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 65 : //влево
            case 37 : //влево
                direction_l = false;
                break;
            case 87 : // вверх
            case 38 : // вверх
                direction_u = false;
                break;
            case 68 :
            case 39 : // вправо
                direction_r = false;
                break;
            case 83 :
            case 40 :
                direction_d = false;
                break;
            default:
                break;
        }
        currentFrame = 6;
        //move_yes = false;
    });
};
