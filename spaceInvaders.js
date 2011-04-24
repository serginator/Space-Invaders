var spaceInvaders = (function(){
    
    /** 
        Sergio Ruiz. Contact: serginator at gmail dot com
                    
        Credits: 
        I've read some spaceinvaders games, but mostly, Canvas Invaders
        from Jason Brown and RGB invaders from Egor Balishev, who helped
        me a few pointing to a good way to learn javascript, even if I 
        started with other resources. Thanks to both of them.
    */ 

    /******************************************************************
                                    VARs
    ******************************************************************/
    var canvas; //Canvas
    var ctx; //The context of the canvas
    var WIDTH; //The width of the canvas
    var HEIGHT; //The height of the canvas
    var shipX; //X position of the ship. The ship is 60x32
    var canvasMinX; //The limit of the canvas
    var canvasMinY;
    var canvasMaxX;
    var intervalId = 0; //The interval for redrawing
    var backcolor = "#000000"; //Background color
    var playerLives = 3; //Counter of lives
    var enemyCount = 0; //Counter of enemies
    var enemies = {}; //Array of enemies
    var shotCount = 0; //Counter of shots
    var shotId = 0; //Shot id
    var shots = {}; // Array of shots
    var invadersChangeDir = false; //To change the direction of invaders
    var invadersDir = 1; //The direction of the invaders
    var invadersMovDown = 0; //To move them one row down
    var invadersSpeed = 5; //The speed of the invaders
    var wave = 1; //The wave
    var showWave = false; //To show a text for a new wave
    var showWaveY = 220; //I have to keep this one instead of just showMessageY
    var showLivePlus = false; //To show a text for +1 live
    var gameOver = true; //Because I want first to load the newGame screen
    var score = 0; //Score
    var yDown = false; //To check whether retry
    var nDown = false; //or not
    var newGame = true; //To load a presentation screen.
    var starCount = 0; //Counter for random stars
    var stars = {}; //Stars array
    var starSpeedMod = 0; //To modify their speed while moving the ship
    var eriTramposilla = false; //For my girlfriend, who like games easiers
    var showMessageY = 220; //To make the animation of all the messages
    var eriShowMessage = false; //To show the message
    var showOvni = false; //To show the ovni
    var ovnis = {}; //Array of ovnis, to add and delete
    var ovniCount = 0; //There could be some :S
    //var brickCount = 0; //Counter for the bricks
    //var bricks = {};
    //var brickcolors = ["#e1d3d3", "#bebebe", "#778899", "#696969"]; //For the bricks
    var pause = false; //To control if game is paused or not
    var penguin = false; //To control if activate mode penguin
    var showPenguinMessage = false; //To show the message
    var points = {}; //To show the points of the enemies when they die
    var pointsCount = 0; //The counter of the points
    var bossFight = false; //To start the fight
    var boss = null; //The boss
    var showBoss = false; //To show the boss
    var bossShowMessage = false; //To show a message
    var bossKilled = false; //To fix waves
 
    /******************************************************************
                                  IMAGES
    ******************************************************************/
    var enemy1A = new Image(); enemy1A.src = "images/enemigo1A.gif";//40x32
    var enemy1B = new Image(); enemy1B.src = "images/enemigo1B.gif";
    var enemy2A = new Image(); enemy2A.src = "images/enemigo2A.gif";
    var enemy2B = new Image(); enemy2B.src = "images/enemigo2B.gif";
    var ship = new Image(); ship.src = "images/nave.gif"; //60x32
    var shot = new Image(); shot.src = "images/disparo.gif"; //2x6
    var enemyProyectil1 = new Image(); 
        enemyProyectil1.src = "images/proyectilEnemigo1.gif"; //6x14
    var enemyProyectil2 = new Image(); 
        enemyProyectil2.src = "images/proyectilEnemigo2.gif";
    var ovni = new Image(); ovni.src = "images/ovni.gif"; //60x32
    var boss1 = new Image(); boss1.src = "images/ovni.gif";
    var boss2 = new Image(); boss2.src = "images/ovni2.gif";
    
    /******************************************************************
                                FUNCTIONS
    ******************************************************************/
    function circle(x, y, r){ //Paint a circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    } //I could use this as shots instead of GIFs
    
    function rect(x, y, w, h){ //Paint a rectangle
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.closePath();
        ctx.fill();
    }
    
	function clear(){ //Clear the canvas
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		//rect(0,0,WIDTH,HEIGHT);
		//because clearRect takes the bg of the canvas,if the back is black
		//it clears it to black.
	}
    
    // This KeyboardController is from Carlos Benitez
    // from www.etnassoft.com
    function KeyboardController(keys, repeat) {
        // Lookup of key codes to timer ID, or null for no repeat
        var timers = {};
        // When key is pressed and we don't already think it's pressed, call the
        // key action callback and set a timer to generate
        // another one after a delay
        document.onkeydown = function(event){
            var key = (event || window.event).keyCode;
            if(!(key in keys)) return true;
            if(!(key in timers)){
                timers[key] = null;
                keys[key]();
                //console.log(key);
                if(repeat !== 0) 
                    if (key == 37 || key == 39){ //To move faster
                        timers[key] = setInterval(keys[key],10);
                    }
		    else if (key == 78 || key == 89 || key == 69 || 
                            key == 80 || key == 190){
			timers[key] = setInterval(keys[key],1000);
		    }
                    else if(eriTramposilla){
                        timers[key] = setInterval(keys[key], 0);
                    }
                    else timers[key] = setInterval(keys[key], repeat);
            }
            return false;
        };
        // Cancel timeout and mark key as released on keyup
        document.onkeyup = function(event){
            var key = (event || window.event).keyCode;
            if(key == 37 || key == 39) starSpeedMod = 0;
            if(key in timers){
                if(timers[key] !== null) clearInterval(timers[key]);
                delete timers[key];
            }
        };
        // When window is unfocused we may not get key events. To prevent this
        // causing a key to 'get stuck down', cancel all held keys
        window.onblur = function(){
            for(var key in timers)
                if(timers[key] !== null) clearInterval(timers[key]);
            timers = {};
        };
    } 
        
    KeyboardController({
        32: function() { //Spacebar
	    if(newGame === true) //To skip the first screen
            {
                newGame = false;
                gameOver = false;
            }
            var shipShot = new Shot(shipX + 30, 450, shot, shot, 5, 1);
            addShot(shipShot);
            //soundManager.play('shot1');
            //console.log('Shot');
        },
        39: function(){ //Move right
            if(shipX <= canvasMaxX-75){
                shipX += 5;
                starSpeedMod = -8; //Create spatial sensation
            }
        },
        37: function(){ //Move left
            if(shipX >= canvasMinX){            
                shipX -=5;
                starSpeedMod = 8; //Create spatial sensation
            }
        },
        89: function(){ //"y" key
            yDown = true;
        },
        78: function(){ //"n" key
            nDown = true;
        },
        69: function(){ //"e" key, an Easter Egg to have turboshots
            if(!eriTramposilla) eriTramposilla = true;
            else eriTramposilla = false;
	    eriShowMessage = true;
        },
        80: function(){ //"p" key, to pause the game
            if(!pause) pause = true;
            else pause = false;
        },
        190: function(){ //"." key, to activate mode penguin
            if(!penguin) penguin = true;
            else penguin = false;
            showPenguinMessage = true;
        }
    }, 200);
    
    function initInvaders(){ //Init the array of the invaders
        for(var i = 0; i < 13; i++){ //12 columns
            for(var j = 0; j < 7; j++){ //7 rows
                var enemy = {};
                enemy.id = enemyCount++; //To move on the array
                enemy.x = 10 + (i*34); //position
                enemy.y = 40 + (j*25);
                enemy._time = 0;
                enemy.frame = 1; //to set which image show
                enemy.delay = 760; 
                enemy._width = 20;
                enemy._height = 16;
                enemy._fire = false; //if true, it can shoot
                if (j%2 === 0){
                    enemy.imgSrc1 = enemy2A;
                    enemy.imgSrc2 = enemy2B;
                }
                else{
                    enemy.imgSrc1 = enemy1A;
                    enemy.imgSrc2 = enemy1B;
                }
                enemies[enemy.id] = enemy; //add it to the array
            }
        }
    }
    
    function addEnemy(enemy){ //to add enemies simply
        enemies[enemy.id] = enemy;
    }
    
    function removeEnemy(enemy){ //to remove them
        delete enemies[enemy.id];
        enemyCount--;
    }
    
    function Shot(_x, _y, _imgSrc1, _imgSrc2, _speed, _type){ //Shots
        this.id = shotId++;
        this.x = _x; //position of the shot
        this.y = _y;
        this.imgSrc1 = _imgSrc1;
        this.imgSrc2 = _imgSrc2;
        this._width = 30; //to check collisions
        this.speed = _speed;
        this.delay = 500; //delay of movement
        this.frame = 1; //same as enemies
        this._time = 0;
        this.type = _type; //because it can be enemy or ship type.
    }
    
    function addShot(shot){ //to add shots easely
        shots[shot.id] = shot;
    }
    
    function removeShot(shot){ //to remove them
        delete shots[shot.id];
        shotCount--;
    }
    
    function Star(_x, _y){ //constructor for Stars
        this.id = starCount++; //to move through the array of stars
        this.x = _x; //star pos
        this.y = _y;
        this.d = Math.floor(Math.random() * 2 + 1);
        if(this.d == 1) this.speed = 2;
        else this.speed = 1.5;
    }
    
    function addStar(star){ //To add a star simply
        stars[star.id] = star;
    }
    
    function removeStar(star){ //To remove a star simply
        delete stars[star.id];
        starCount--;
    }
    
    function initStars(){ //To init the stars with random values
        for(var i = 0; i < 50; i++){
            var posX = Math.floor(Math.random() * WIDTH);
            var posY = Math.floor(Math.random() * HEIGHT);
            var star = new Star(posX, posY);
            addStar(star); //Add it to the array
        }
    }
    
    function drawStars(){ //Draw stars
        for(var id in stars){
            var star = stars[id];
            //If the ship is moving then starSpeedMod makes star move
            //and make a great sensation of movement, i've watched it in 
            //rgb invaders and i liked it
            star.x += star.speed * starSpeedMod * 0.1;
            star.y += star.speed;
            if(star.y >= HEIGHT){ //if it reaches the bottom, randomize it x
                star.x = Math.floor(Math.random() * WIDTH + 100);
                star.y = 0;
            }
            ctx.save();
            ctx.fillStyle = "white";
            circle(star.x, star.y, star.d); //draw the little dots
            ctx.restore(); //restore the canvas
        }
    }
    
    function Ovni(_x, _y){ //The constructor of the ovni
        this.id = ovniCount++;
        this.x = _x; //Its position
        this.y = _y;
        this.speed = 3; //ovni speed
        this.width = 60;
        this.height = 32;
        this.points = 1500 * wave; //The points it gives
        this.imgScr = ovni; //Its image
    }
    
    function addOvni(ufo){ //To add it to the array
        ovnis[ufo.id] = ufo;
    }
    
    function removeOvni(ufo){ //To remove it
        delete ovnis[ufo.id];
        ovniCount--;
        showOvni = false;
    }
    
    function drawOvni(){ //To draw the ovni
        var ufo;
        if(enemyCount == 30 && ovniCount != 1){
            showOvni = true; //to run the next if
            ufo = new Ovni(30, 40); //Draw ovni
            addOvni(ufo);
        }
        if(showOvni){
            for(var id in ovnis){
                ufo = ovnis[id];
                ctx.drawImage(ovni, ufo.x, ufo.y);
                ufo.x += ufo.speed; //movement
                if(ufo.x > WIDTH){ //if it reaches the right side
                    removeOvni(ufo);
                    showOvni = false;
                }
            }
        }
    }
    
    function Point(_x, _y, _p){
	this.id = pointsCount++;
	this.x = _x;
	this.y = _y;
	this.p = _p; //points to show
        this.t = 20;
    }

    function addPoint(point){
	points[point.id] = point;
    }

    function removePoint(point){
	delete points[point.id];
	pointsCount--;
    }

    function drawPoints(){ //Draw points
        for(var id in points){
            var point = points[id];
            point.t--;
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "italic 400 10px/2 Unknown Font, sans-serif";
            ctx.fillText(point.p, point.x, point.y); //Draw the points
            if(point.t === 0){
                removePoint(point);
            }
            ctx.restore();
        }
    }
    
    function Boss(_x, _y){
        this.x = _x;
        this.y = _y;
        this.lives = 80;
        this.points = wave * 100000;
        this.time = 0;
        this.frame = 1; //to set which image show
        this.speed = 3;
        this._width = 120;
        this._height = 64;
        this._fire = false; //if true, it can shoot
    }
    
    function drawBoss(){
        //console.log("draw");
        if(!showBoss){
            console.log("Boss Created");
            boss = new Boss((WIDTH/2) + (120/2), 100);
            bossShowMessage = true;
            showBoss = true;
        }
        else{
            //console.log("Drawing boss");
            if(boss.frame === 1){
                //console.log("frame 1");
                ctx.drawImage(boss1, boss.x, boss.y, 120, 64);
            } //Draw the src1 of the boss
            else{
                //console.log("frame 2");
                ctx.drawImage(boss2, boss.x, boss.y, 120, 64);
            } //Draw the src2 of the boss
            
            //Now a red rectangle with the boss' life.
            //It will decrease deppending on the lives.
            ctx.fillStyle = "red";
            rect(boss.x + 20, boss.y + 70, 80 - (80 - boss.lives), 5);
            
            boss.x += boss.speed; //movement
            if(boss.x > (WIDTH - boss._width - 20)){ //if it reaches the right side
                boss.speed = -boss.speed;
                boss.frame = -boss.frame;
            }
            else if(boss.x <= 20){
                boss.speed = -boss.speed;
                boss.frame = -boss.frame;
            }
            var testShot = Math.floor(Math.random() * 500 + 1);
            if((testShot - wave*0.4) < 20 - ((80 - boss.lives)/20)){
                boss._fire = true;
            }
            if(boss._fire === true){ //If they can shoot,create the shot
                boss._fire = false;
                var shotBoss = new Shot(boss.x+(boss._width/2),boss.y+10,
                               enemyProyectil1, enemyProyectil2, -5, 2);
                addShot(shotBoss); //And add it to the array
            }
            if(boss.lives === 0){
                //console.log("0 vidas");
                wave++;
                var points = new Point(shot.x, shot.y, boss.points);
                addPoint(points);
                score += boss.points;
                delete boss;
                bossFight = false;
                showBoss = false;
                bossKilled = true;
                playerLives = 3;
            }
        }
    }
    
    /*function Brick(_x, _y){
        this.id = brickCount++;
        this.x = _x;
        this.y = _y;
        this.width = 10;
        this.heigth = 10;
        this.lives = 4;
        this.color = ["#e1d3d3", "#bebebe", "#778899", "#696969"];
    }
    
    function addBrick(brick){
        bricks[brick.id] = brick;
    }
    
    function removeBrick(brick){
        delete bricks[brick.id];
        brickCount--;
    }
    
    function drawBlockOfBricks(_x, _y){
        for(i = 0; i < 3; i++){
            for(j = 0; j < 3; j++){
                if(i == 2 && j == 1) null;
                else{
                    for(var bid in bricks){
                        
                    }
                }
            }
        }
    }
    
    function drawBricks(){
        
    }*/
    
    function setScore(){ //Set the score at the bottom left
        ctx.fillStyle = "#8b8989";
        rect(0,485,WIDTH,15); //Create a rectangle at the bottom
        ctx.fillStyle = "#000000";
        ctx.font = "italic 400 12px/2 Unknown Font, sans-serif";
        ctx.fillText("Score: " + score, 10, 495);
        //And some credits
        ctx.fillText("6-3-2011", 585, 495);
        ctx.fillStyle = "#FF0000";
        ctx.fillText("Sergio Ruiz", 292, 495);
    }
    
    function showWaveLives(){ //Show the wave and if you have gained +1 live
        if(showWave){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.font = "400 15px/2 Unknown Font, sans-serif";
            ctx.fillText("Wave " + wave, 300, showWaveY);
	    if(showLivePlus && !bossKilled){ //if bossKilled, restore all lives
		ctx.fillText("+1 ", 300, showWaveY + 20);
		ctx.drawImage(ship, 330, showWaveY + 10, 15, 8);
                ctx.restore();
            }
            showWaveY += 1; //To create the animation
            if(showWaveY == 450){
                showWaveY = 220;
                showWave = false;
		if (showLivePlus) showLivePlus = false;
            }
        }
    }
    
    function penguinMode(){ //To activate penguin mode
        if(penguin){
            enemy1A.src = "images/enemigo1A.gif";//40x32
            enemy1B.src = "images/enemigo1B.gif";
            enemy2A.src = "images/enemigo2A.gif";
            enemy2B.src = "images/enemigo2B.gif";
            ship.src = "images/penguin.gif"; //60x32
            shot.src = "images/gob.gif"; //2x6
            enemyProyectil1.src = "images/proyectilEnemigo1.gif"; //6x14
            enemyProyectil2.src = "images/proyectilEnemigo2.gif";
            ovni.src = "images/foca.gif"; //60x32
            boss1.src = "images/foca.gif";
            boss2.src = "images/foca2.gif";
        }
	else{
            enemy1A.src = "images/enemigo1A.gif";//40x32
            enemy1B.src = "images/enemigo1B.gif";
            enemy2A.src = "images/enemigo2A.gif";
            enemy2B.src = "images/enemigo2B.gif";
            ship.src = "images/nave.gif"; //60x32
            shot.src = "images/disparo.gif"; //2x6
            enemyProyectil1.src = "images/proyectilEnemigo1.gif"; //6x14
            enemyProyectil2.src = "images/proyectilEnemigo2.gif";
            ovni.src = "images/ovni.gif"; //60x32
            boss1.src = "images/ovni.gif";
            boss2.src = "images/ovni2.gif";
	}
    }
	
    function penguinMessage(){
        if(showPenguinMessage){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.font = "400 20px/2 Unknown Font, sans-serif";
            if(penguin){
                ctx.fillText("Penguin Mode Activated", 220, showMessageY);
            }
            else{
                ctx.fillText("Penguin Mode Deactivated", 220, showMessageY);
            }
            ctx.restore();
            showMessageY += 5; //To create the animation
            if(showMessageY == 450){
                showMessageY = 220;
                showPenguinMessage = false;
            }
        }
    }
    
    function eriMessage(){
        if(eriShowMessage){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.font = "400 20px/2 Unknown Font, sans-serif";
            if(eriTramposilla){
                ctx.fillText("Turboshooting mode ON", 220, showMessageY);
            }
            else{
                ctx.fillText("Turboshooting mode OFF", 220, showMessageY);
            }
            ctx.restore();
            showMessageY += 5; //To create the animation
            if(showMessageY == 450){
                showMessageY = 220;
                eriShowMessage = false;
            }
        }
    }
    
    function bossMessage(){
        if(bossShowMessage){
            ctx.save();
            ctx.fillStyle = "red";
            ctx.font = "400 20px/2 Unknown Font, sans-serif";
            if(bossFight){
                ctx.fillText("Wave " + wave, 280, showMessageY);
                ctx.fillText("Boss Fight!", 280, showMessageY + 20);
            }
            ctx.restore();
            showMessageY += 1; //To create the animation
            if(showMessageY == 450){
                showMessageY = 220;
                bossShowMessage = false;
            }
        }
    }
    
    function collisions(){ //Check collisions
        var enemy;
        for(var id in shots){ //check ship's shots
            var shot = shots[id];
            if(shot.type == 1){ //Ship
                for(var eid in enemies){
                    enemy = enemies[eid];
                    if(shot.x >= enemy.x && shot.x <= (enemy.x + enemy._width)){
                    if(shot.y >= enemy.y && shot.y <= (enemy.y +enemy._height)){
                        var point = new Point(shot.x, shot.y, 50*wave);
                        addPoint(point);
                        removeEnemy(enemy);
                        removeShot(shot);
                        score += 50 * wave;
                        //soundManager.play('explosion1');
                    }
                    }
                }
                for(var oid in ovnis){ //Ovni
                    var ufo = ovnis[oid];
                    if(shot.x >= ufo.x && shot.x <= (ufo.x + ufo.width)){
                        if(shot.y >= ufo.y && shot.y <= (ufo.y + ufo.height)){
                            var points = new Point(shot.x, shot.y, ufo.points);
                            addPoint(points);
                            score += ufo.points;
                            removeOvni(ufo);
                            removeShot(shot);
                            //soundManager.play('explosion2');
                        }
                    }
                }
                if(bossFight){
                    if(shot.x >= boss.x && shot.x <= (boss.x + boss._width)){
                        if(shot.y >= boss.y && shot.y <= (boss.y + boss._height)){
                            removeShot(shot);
                            boss.lives--;
                            //soundManager.play('explosion2');
                            //console.log(boss.lives);
                        }
                    }
                }
            }
            else{//check enemies and boss' shots
                if(shot.x >= shipX && shot.x <= (shipX + 60)){
                    if(shot.y >= 450 && shot.y <= (32 + 450)){
                        removeShot(shot);
                        playerLives--;
                        //soundManager.play('explosion2');
                    }
                }
            }
            //missed shots
            if(shot.y <= 0 || shot.y > HEIGHT) removeShot(shot);
        }
        for(var eid2 in enemies){ //Check enemies
            enemy = enemies[eid2];
            //Check if they touch the ship
            if(enemy.x < (shipX + 60) && (enemy.x + enemy._width) > shipX){
                if((enemy.y + enemy._height)>= (HEIGHT - 32)){
                    removeEnemy(enemy);
                    playerLives--;
                }
            }
            //Check if they reach the end
            if((enemy.y + enemy._height) >= HEIGHT){
                removeEnemy(enemy);
                playerLives = 0;
            }
        }
        //check boss
    }
    
    function init(){ //Draw every 10ms
        //Get the canvas
        canvas = document.getElementById("canvas");
        //Get the context to the canvas
        ctx = canvas.getContext("2d");
        //Load WIDTH
        WIDTH = canvas.width;
        //Load HEIGHT
        HEIGHT = canvas.height - 15; //because of the bottom bar with Score
        //Put ship in the middle of the screen
        shipX = (WIDTH / 2) - 30; //because ship's width is 60
        //Set the left limit of the canvas for the mouse
        //canvasMinX = $("#canvas").offset().left - 350;
        canvasMinX = 8;
        //Now set the right edge for the mouse
        canvasMaxX = canvasMinX + WIDTH;
        //Create enemy array
            initInvaders();
            //Create star arrays
            initStars();
        //Draw every 10ms to create movement illusion
        intervalId = setInterval(draw, 10);
        return intervalId;
    }
    
    function draw(){ //Draw the canvas
        //First clean the screen
        ctx.fillStyle = backcolor; 
        clear();
        
        if(!gameOver){ //If the game isn't over
            if(!pause){
                if(playerLives === 0){ //Check if you've lost or not the game
                    gameOver = true;
                }
                
                if(wave%10 === 0) bossFight = true;
                
                if(yDown) yDown = false;
                
                penguinMode();
				penguinMessage();
				
				eriMessage();
                
                bossMessage();
                
                //Draw and move the ship if left or right is pressed
                ctx.drawImage(ship, shipX, 450);//Draw the ship
                
                if(!bossFight){ //Normal game
                    //console.log("wave" + wave +", normal game");
                    if(invadersChangeDir === true){ //Change direction of invaders
                        invadersChangeDir = false;
                        invadersDir = -invadersDir;
                        invadersSpeed = -invadersSpeed; //Inverse the speed
                        invadersMovDown = 10; //Move them one row down
                    }
                
                    //Draw enemies
                    for(var id in enemies){
                        var enemy = enemies[id];
                        //Change the delay
                        enemy.delay = (enemyCount * 20) - (wave * 10);
                        if(enemy.delay <= 300) enemy.delay = 300;
                        enemy._time += 100;
                        if(enemy._time >= enemy.delay){
                            //Test if they shoot or not
                            var testShot = Math.floor(Math.random() *enemy.delay+1);
                            if((testShot - wave*0.4) < (enemy.delay / 200)){
                                enemy._fire = true;
                            }
                            if(enemy.x + (enemy._width + 15) >= (WIDTH - wave*10)
                               && invadersDir == 1){ //Right border
                                invadersChangeDir = true;
                            }
                            else if(enemy.x - 15 <= (0+wave*2) && invadersDir != 1){
                                invadersChangeDir = true;
                            }
                            
                            enemy.frame = -enemy.frame; //Draw the other image
                            enemy.x += invadersSpeed; //Move them on the x axis
                            enemy._time = 0;
                        }
                        enemy.y += invadersMovDown; //move down a row or not
                        if(enemy._fire === true){ //If they can shoot,create the shot
                            enemy._fire = false;
                            var shotEnemy = new Shot(enemy.x+(enemy._width/2),enemy.y+10,
                                           enemyProyectil1, enemyProyectil2, -5, 2);
                            addShot(shotEnemy); //And add it to the array
                            //soundManager.play('shot2');
                        }
                        ctx.save();
                        if(enemy.frame == 1){
                            ctx.drawImage(enemy.imgSrc1, enemy.x, enemy.y, 20, 16);
                        } //Draw the src1 of an enemy
                        else{
                            ctx.drawImage(enemy.imgSrc2, enemy.x, enemy.y, 20, 16);
                        } //Draw the src2 of an enemy
                        ctx.restore(); //restore the canvas
                    }
                    invadersMovDown = 0; //Reset the movement on the y axis
                    
                    drawOvni(); //Draw the ovni
                    
                    //New wave and +1 live bonus
                    if(enemyCount === 0){
                        wave++;
                        if(wave%10 != 0){
                            //console.log("Oleada " + wave);
                            if(bossKilled){
                                wave--;
                                bossKilled = false;
                            }
                            showWave = true; //To show the new wave in showWaveLives()
                            if(playerLives < 3){
                                playerLives++; //Increase a live
                                showLivePlus = true; //Show it in showWaveLives()
                            }
                            //Can I delete shots like that?Or should I do for sid in shots
                            //var shot = shots[sid]; removeShot(shot.id); ?
                            shots = {};
                            initInvaders(); //Restart the enemy array
                            //invadersSpeed = invadersSpeed + 0.2*wave;
                        }
                    }
                    showWaveLives(); //Show the info
                }
                else{ //Boss Fight!
                    //console.log("wave" + wave +", boss fight");
                    drawBoss();
                }
                
                //Draw proyectiles
                for(var sid in shots){
                    var shot = shots[sid]; 
                    shot._time += 100;
                    shot.y -= shot.speed;
                    if(shot._time >= shot.delay){
                        shot._time = 0;
                        shot.frame = -shot.frame;
                    }
                    removeShot(shot);
                    addShot(shot);
                    ctx.save();
                    if(shots.frame == 1){
                        ctx.drawImage(shot.imgSrc1, shot.x, shot.y);
                    } //Draw the src1 of a shot
                    else{
                        ctx.drawImage(shot.imgSrc2, shot.x, shot.y);
                    } //Draw the src2 of a shot
                    ctx.restore(); //restore the canvas
                }
                
                drawStars(); //Draw the stars
                
                drawPoints(); //To show the points of the enemies down
                
                collisions(); //Check for collisions of shots
                
                for(var i = 0; i < playerLives; i++){ //Draw lives
                    ctx.save();
                    ctx.fillStyle = "green";
                    ctx.font = "400 15px/2 Unknown Font, sans-serif";
                    ctx.fillText("Lives: ", 480, 25);
                    ctx.drawImage(ship, (WIDTH/2) + 200 + (i * 40), 10, 30, 16);
                    ctx.restore();
                }
                
                setScore(); //Draw and set the score
                
            } //pause true
            else{
                ctx.fillStyle = "red";
                ctx.font = "italic 400 100px/2 Unknown Font, sans-serif";
                ctx.fillText("Pause", 185, 250);
                ctx.font = "italic 400 40px/2 Unknown Font, sans-serif";
                ctx.fillText("push P to continue", 170, 300);
            }
        }
        else{ //gameOver true
            if(newGame){ //Just at the beginning of the game
                ctx.drawImage(enemy1A, 125, 40, 400, 320);
                ctx.font = "italic 400 50px/2 Unknown Font, sans-serif";
                ctx.fillStyle = "white";
                ctx.fillText("Space Invaders", 140, 400); 
                ctx.font = "italic 400 20px/2 Unknown Font, sans-serif";
                ctx.fillText("by Sergio Ruiz. 2011", 305, 450);
                ctx.fillStyle = "red";
                ctx.fillText("Move: Left, Right", 240, 220);
                ctx.fillText("Shoot: Space", 255, 240);
                ctx.fillText("Pause: P", 270, 260);
				ctx.font = "italic 400 10px/2 Unknown Font, sans-serif";
				ctx.fillText("Penguin: .", 290, 270);
				ctx.font = "italic 400 20px/2 Unknown Font, sans-serif";
                ctx.fillText("Press space", 270, 300);
            }
            else{ //If you lose
                ctx.fillStyle = "red";
                ctx.font = "italic 400 100px/2 Unknown Font, sans-serif";
                ctx.fillText("You lose!", 100, 250);
                ctx.font = "italic 400 50px/2 Unknown Font, sans-serif";
                ctx.fillText("Score: " + score, 100, 350);
                ctx.font = "italic 400 30px/2 Unknown Font, sans-serif";
                ctx.fillText("retry? (y, n)", 100, 400);
                if(yDown){ //Restart the init vars
                    playerLives = 3;
                    wave = 1;
                    bossFight = false;
                    showBoss = false;
                    shots = {};
                    enemyCount = 0;
                    score = 0;
					penguin = false;
                    initInvaders();
                    gameOver = false;
                }
                else if(nDown){ //Say good bye and end the drawing
                    ctx.fillStyle = backcolor; 
                    clear();
                    ctx.fillStyle = "red";
                    ctx.font = "italic 400 100px/2 Unknown Font,sans-serif";
                    ctx.fillText("Good bye!", 100, 250);
                    ctx.font = "italic 400 50px/2 Unknown Font, sans-serif";
                    ctx.fillText("Thanks for playing", 100, 350);
                    clearInterval(intervalId);
                    nDown = false;
                }
            }
        }
    }
    
    /******************************************************************
                               MAIN PROGRAM
    ******************************************************************/
    
    init();
    
})();
