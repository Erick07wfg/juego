const hoja = document.getElementById('lienzo')
const dibujo = hoja.getContext('2d')
let clouds = []
let limit = 20
let time = 0
let level = 1
let levelStage = 1
let game = true
let powerUp = false
const pressedControls = {
  right: false,
  left: false,
  up: false,
  down: false,
  space:false,
}

function handleKeyDown(e){
  if(e.code=='ArrowLeft') pressedControls.left = true
  if(e.code=='ArrowRight') pressedControls.right= true
  if(e.code=='ArrowUp') pressedControls.up = true
  if(e.code=='ArrowDown') pressedControls.down = true
  if(e.code=='Space') pressedControls.space = true
  }
function handleKeyUp(e){
  if(e.code=='ArrowLeft') pressedControls.left = false
  if(e.code=='ArrowRight') pressedControls.right= false
  if(e.code=='ArrowUp') pressedControls.up = false
  if(e.code=='ArrowDown') pressedControls.down = false
  if(e.code=='Space') pressedControls.space = false
}

function random(min,max){
  [min,max]=[parseInt(min),parseInt(max)]
  if(min>max){[min,max]=[max,min]}
  max++
  return Math.floor(Math.random()*(max-min)+min)
  }
  
  function randClodBgColor(){
    const r = 132, g = 136, b = 147
    const rgba = `rgb(${random(r-5,r)},${random(g-5,g)},${random(b-5,b)})`
    return rgba
    }
    
class Cloud {
constructor(x,y,size,life){
  this.size = size
  this.y = y;
  this.x = x;
  this.backgroundColor = randClodBgColor()
  this.life = life
  }
  draw(){
    dibujo.fillStyle = this.backgroundColor
    dibujo.beginPath()
    dibujo.arc(this.x,this.y,this.size,0,Math.PI*2,true)
    dibujo.closePath()
    dibujo.fill()
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////PROYECTILES ENEMIGOS /////////////////////////////////////////////
let drops = []
let nextDropTime = performance.now()
const dropTimeRange = {
  low: 500,
  up: 1000
}
const dropsDownDelta = 5
class Drop{
  constructor(x){
    this.y = 0
    this.x = x,
    this.color = '#00f'
  }
  draw(){
    dibujo.fillStyle = this.color
    dibujo.fillRect(this.x,this.y+=dropsDownDelta,10,30)
  }
}
function colision(drop){
  return drop.y>=character.y && drop.y+30<=character.y+character.height && drop.x>=character.x && drop.x+10<=character.x+character.width
}
function drawDrops(){
  drops = drops.flatMap((drop)=>{
    if(drop.y<hoja.height){
      drop.draw()
      if(colision(drop)){
        character.life-=34
        return[]
      } else{
        return [drop]
      }
    }
    else{
      levelStage++
      return []
    }
  })
}
function stackDrops(){
  if(nextDropTime<performance.now()){
    nextDropTime=performance.now()+random(dropTimeRange.low/level,dropTimeRange.up/level)
    drops.push(new Drop(random(0,hoja.width)))
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////BASE DEL JUGADOR/////////////////////////////////////////////////////
const playerMoveDelta = 5
const character = {
  y:400,
  x:400,
  color: '#0080ff',
  width:100,
  height:100,
  life: 340,
  draw(){
    dibujo.fillStyle = this.color;
    dibujo.fillRect(this.x,this.y,this.width,this.height)
  },
  physics(){
    if(!pressedControls.up && character.y<hoja.height-character.height){
      character.y+=1;
    }
  },
  check(){
    if(this.life<=0){
      game = false
    }
  }
}
function handlePlayerMovement(){
  if(pressedControls.down && character.y+playerMoveDelta<hoja.height-character.height) character.y+=playerMoveDelta
  if(pressedControls.up && character.y+playerMoveDelta>0) character.y-=playerMoveDelta
  if(pressedControls.left && character.x-playerMoveDelta>0) character.x-=playerMoveDelta
  if(pressedControls.right && character.x+playerMoveDelta<hoja.width-character.width) character.x+=playerMoveDelta
}
let shoots = []
class shoot{
  constructor(x,y,damage){
    this.x = x
    this.y = y
    this.damage = damage
    this.color = '#ff0'
  }
  draw(){
    dibujo.fillStyle = this.color
    dibujo.fillRect(this.x,this.y-=10,10,30)
  }
}
let recarge = performance.now()
function ready(){
  if(recarge<performance.now()){
    recarge = performance.now()+100
    return true
    } else {
    return false
  }
}
function shootColision(shoot){
  for(i=1;i<clouds.length;i++){
    if(shoot.y<clouds[i].y+(clouds[i].size*2)-10 && shoot.x>=clouds[i].x && shoot.x<=clouds[i].x+(clouds[i].size*2)){
      console.log('cloud.x:' ,clouds[i].x)
      console.log('shoot.x:' ,shoot.x)
      return i
    }
  }
  return -1
}
function handlePlayerShoots(){
  if(pressedControls.space && ready()) shoots.push(new shoot(character.x+(character.width/2),character.y),(powerUp? 20:10))
  shoots = shoots.flatMap((shoot) =>{
    let x = shootColision(shoot)
    if(shoot.y>-100){
      shoot.draw()
      if(x>-1){
        clouds[x].life-=34
        return []
      } else {
        return [shoot]
      }
    } else {
      return []
    }
  })
}
function handleLevel(){
  if(levelStage>=limit){
    limit+=10;
    level++
    levelStage=1
  }
}
const lifeBar = {
  color: '#700',
  draw(){
    dibujo.fillStyle = this.color
    dibujo.strokeRect(1100,30,350,50)
    dibujo.fillRect(1105,35,character.life,40)
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////
 
////////////////////////////RECARGAR LA PANTALLA//////////////////////////////////////////////
function render(){
  if(game) requestAnimationFrame(render);
  dibujo.clearRect(0,0,hoja.width,hoja.height)
  handlePlayerMovement()
  handleLevel()
  stackDrops()
  drawDrops()
  handlePlayerShoots()
  character.check()
  character.draw()
  character.physics()
  clouds = clouds.flatMap( (Cloud) => {
    if(Cloud.life>0){
      Cloud.draw()
      return [Cloud]
    } else {
      console.log(Cloud)
      return []
    }
  })
  // clouds.forEach((Cloud) => Cloud.draw())
  dibujo.fillStyle = '#000'
  dibujo.fillText(level,20,50)
  dibujo.fillText(levelStage,20,100)
  lifeBar.draw()
}
  //////////////////////////////////////////////////////////////////////////////////////////////
  
  ////////////////////////////MOVIMIENTO DEL JUGADOR //////////////////////////////////////////
function init(){
  for(i=0;i<100;i++){
     clouds.push(new Cloud(random(0,hoja.width),random(0,100),random(50,90),random(100,200)));
  }
  dibujo.font= '48px sans-serif'
  document.addEventListener('keydown',handleKeyDown)
  document.addEventListener('keyup',handleKeyUp)
}
//////////////////////////////////////////////////////////////////////////////////////////////
init()
render()
