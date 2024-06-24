// create a js element called canvas and then point js towards it using dom.
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;
let playerState = 'idle';
const dropdown = document.getElementById('animations');
dropdown.addEventListener('change',  function(e)
{
    playerState = e.target.value;
})

const playerImage = new Image();
playerImage.src = 'gloomCoin.png';
const bankImage = new Image();
bankImage.src = 'biggyBanks.png';
const spriteWidth = 575;
const spriteHeight = 523;



let frameX = 0;
let frameY = 1;
let gameFrame = 0;
const staggerFrames = 5;
const spriteAnimations = [];
const coinAnimationStates =
[
    {
        name: 'roll',
        frames: 8,
    }, //1
];

coinAnimationStates.forEach((state,index) => {
    let frames = 
    {
        loc: [],
    }
    for (let j = 0; j < state.frames; j++)
    {
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x: positionX,y:positionY});
    }
    spriteAnimations[state.name] = frames;
});
console.log(coinAnimationStates);

function animate()
{
    // Clear everything in the rectangle using parameters below.
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    let position = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length;
    let frameX = spriteWidth * position;
    let frameY = spriteAnimations[playerState].loc[position].y;

    ctx.drawImage(playerImage,frameX,frameY,spriteWidth,spriteHeight,0,0,
        spriteWidth,spriteHeight);

    gameFrame++;
    requestAnimationFrame(animate);
};
animate();