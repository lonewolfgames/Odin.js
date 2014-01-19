define([
        "odin/odin",
        "character"
    ],
    function(Odin, Character) {


        var Time = Odin.Time,

            Mathf = Odin.Mathf,
            randFloat = Mathf.randFloat,
            randSign = Mathf.randSign,
            sin = Math.sin,
            cos = Math.cos,
            atan2 = Math.atan2,
            abs = Math.abs,
            PI = Math.PI,
            TWO_PI = 2 * PI,

            direction = Mathf.direction,
            sqrt = Math.sqrt;


        function Zombie(opts) {
            opts || (opts = {});

            Character.call(this, opts);

            this.player = undefined;
            this.time = 0;
            this.turnTime = randFloat(0, 1);

            this.dir = TWO_PI;

            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
        }

        Character.extend(Zombie);


        Zombie.prototype.init = function() {

        };


        Zombie.prototype.update = function() {
            var position = this.transform2d.position,
                animation = this.spriteAnimation,
                player = this.player || (this.player = this.gameObject.scene.findByTagFirst("Player")),
                playerPosition,
                dt = Time.delta,
                dir = this.dir,
                spd = this.spd,
                x = this.x,
                y = this.y,
                follow;

            this.hitTimer(dt);

            if (this.dead) {
                animation.play("death", Odin.Enums.WrapMode.Clamp);
                this.collisionObject.mass = 0;
                return;
            }

            if (player && !player.character.dead) {
                playerPosition = player.transform2d.position;
                if (abs(position.lengthSq() - playerPosition.lengthSq()) <= 24) follow = true;
            }

            if (follow) this.dir = atan2(playerPosition.y - position.y, playerPosition.x - position.x);

            this.time += dt;
            if (this.time >= this.turnTime) {
                dir = this.dir += randSign() * PI * 0.1;

                this.turnTime = randFloat(0, 1);
                this.time = 0;

                if (!this.hit) {
                    animation.play(direction(x, y));
                    animation.rate = 1 / (spd * 10 * (x * x + y * y));
                }
            }

            this.x = x = cos(dir);
            this.y = y = sin(dir);

            position.x += dt * spd * x;
            position.y += dt * spd * y;
        };


        return Zombie;
    }
);
