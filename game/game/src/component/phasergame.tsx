// src/PhaserGame.tsx
import React, { useEffect, useRef, useState } from 'react';
import Phaser, { Input, LEFT, Physics } from 'phaser';
import { useWebsocket } from "../hooks/serverconnection";
import { VideoCall } from './videocall';

let platforms : Physics.Arcade.StaticGroup  ;
let player:Phaser.Physics.Arcade.Sprite;
let stars:any
let score:number =0
let scoreText:any
let sceneref : Phaser.Scene
let arrayposition:number
let player1:Phaser.Physics.Arcade.Sprite 
let camera : Phaser.Cameras.Scene2D.Camera

let callButton:Phaser.GameObjects.Text | undefined
let receiveButton:Phaser.GameObjects.Text

let makeamoved:boolean  = false

const players:playersType = {}



// const configuration = {
//     'iceServers' : [
//     { urls: 'stun:stun1.l.google.com:19302' }, 
//     { urls: 'stun:stun2.l.google.com:19302' }
//   ]
//    }

// const peerConnection = new RTCPeerConnection(configuration)




interface playersType  {
  [key:number] : { 
      player : Phaser.Physics.Arcade.Sprite,
      x: number,
      y: number
  }
}

interface callData {
     event : string,
     sdp : RTCSessionDescriptionInit,
     candidate : RTCIceCandidate
}

interface Acceptdata {
    event : string,
    sdp : RTCSessionDescriptionInit,
    candidate : RTCIceCandidate

}



  


const PhaserGame: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaseGameRead = useRef<Phaser.Game | null>(null);
  const [call , setCall]  = useState<boolean>(false)
  const [receivecall , setReceiveCall] = useState<boolean>(false)
   const socket = useRef<WebSocket|null>(null)
   const [acceptcall , setAcceptCall] = useState(false)
   const calldata = useRef<null | callData >(null)
   const [acceptdata , setAcceptdata] = useState<null | Acceptdata>(null)
    socket.current = useWebsocket()


   // this is for the caller side 
      


//   let socket:WebSocket | null = null 




  console.log("Page has bee refreshedd")

  const positions = [{x:200,y:200},{x:300,y:200}]









     

//   useEffect(()=>{
//      console.log("Changes are made in a socket")

//   },[socket])





  useEffect(() => {
    console.log("use effect is running")

    if (!phaseGameRead.current){
        console.log("object is again created")
        console.log(phaseGameRead.current)
        const  config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameContainerRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {x:0, y: 300 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        }
        phaseGameRead.current = new Phaser.Game(config);
    }

  

    function preload (this: Phaser.Scene)
    { 
        console.log("preload is called")
        sceneref = this
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('chair','assets/chair.jpg')
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }
    


    
       

     function create (this:Phaser.Scene)
        {
            console.log("create funtion called")
             camera = this.cameras.main
          
    
            this.add.image(400, 5000, 'sky');
            platforms = this?.physics?.add.staticGroup();
            platforms?.create(400, 568, 'ground').setScale(1).refreshBody()
            platforms?.create(600, 400, 'ground');
            platforms?.create(50, 250, 'ground');
            platforms?.create(750, 220, 'ground');
            // platforms?.create(400, 300, "chair").setScale(0).refreshBody();

            arrayposition = Math.floor(Math.random()*2)

            if (!player){
                player = this.physics.add.sprite(positions[arrayposition].x,positions[arrayposition].y,"dude")
                player.setBounce(0.2)
                player.setCollideWorldBounds(true);

            }

          
          
            camera.startFollow(player , true , 0.1 ,0.1,20,20) 
            

            socket.current?.send(JSON.stringify({id: arrayposition, "event":"connect",x:positions[arrayposition].x,y:positions[arrayposition].y}))
            players[arrayposition] = {player:player,x:positions[arrayposition].y,y:positions[arrayposition].y}



           this.anims.create({
               key : 'left',
               frames: this.anims.generateFrameNumbers('dude',{start:0,end:3}),
               frameRate:10,
               repeat:-1
           });

           this.anims.create({
            key : "turn",
            frames : [ {key:'dude',frame:4} ],
            frameRate : 20
           });

           this.anims.create({
             key : 'right',
             frames : this.anims.generateFrameNames('dude',{start:5,end:8}),
             frameRate: 10 ,
             repeat: -1

           });

        //     stars = this.physics.add.group({
        //     key: 'star',
        //     repeat: 11,
        //     setXY: { x: 12, y: 0, stepX: 70 }
        // });

        // stars.children.iterate(function (child: Phaser.GameObjects.GameObject) {
        //     (child.body as Phaser.Physics.Arcade.Body).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        //     return true;  // Returning true to continue iteration
        //   });

        //   this.physics.add.collider(stars, platforms);

        //   player?.body?.setGravityY(0);
        //   this.physics.collide(stars,platforms)

        // player.body.setGravityY(0);
        
        

        // (player.body as Phaser.Physics.Arcade.Body).setGravityY(0);

        this.physics.add.collider(player, platforms);

        // scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' });


        // listen to the call button it is clicked or not 

        }

    
        // function collectStar (player:any, star:any)
        // {
        //     star.disableBody(true, true);
        //     score+=10
        //     scoreText.setText('Score: ' + score);
            
        // }



//   call the user 
        function createTheButton(this:Phaser.Scene){

            callButton = this.add.text(player.x, player.y-20, 'call 📞')
            callButton.setInteractive()
            callButton.on(("pointerdown"),()=>{

                setCall((call)=>!call) 
            })
        }

        function update (this:Phaser.Scene)
        {
          
        
            let cursors: any = this?.input?.keyboard?.createCursorKeys();
            
             
            if (cursors.left.isDown){
                // let check = player.x > player1.x  ? player.x-player1.x : player1.x-player.x;
                 if (player1)
                       { 
                        if (player.x-player1?.x < 50 && player.x-player1?.x>0 && player1.y == player.y){

                            if (!callButton){
                                console.log("button is not there")
                                createTheButton.call(this);
                            }
                            callButton?.setPosition(player.x,player.y-5)
                            callButton?.setVisible(true)
                            return
                        }
                    }

                player.setVelocityX(-160)
                player.anims.play("left",true)
                socket.current?.send(JSON.stringify({ direction : "left", id: arrayposition, "event":"move",x:player.x,y:player.y}))
                makeamoved  = true
                // callButton.disabledBody(true,true)

                if (callButton)
                {
                    callButton.setVisible(false)
                }

            }

           else if (cursors.right.isDown){
             
            // let check = player.x > player1.x  ? player.x-player1.x : ;
            if (player1)
                if (player1?.x-player?.x < 50 && player1?.x-player?.x>0 && player1.y == player.y ){

                    if (!callButton){
                        // createTheButton.call(this);
                    }
         
                    return
                }

            player.setVelocityX(160)
            player.anims.play("right",true)
            socket.current?.send(JSON.stringify({ direction : "right" , id: arrayposition, "event":"move",x:player.x,y:player.y}))
            makeamoved  = true

           }
    
           else{
            player.setVelocityX(0);
          
             
            player.anims.play('turn');
             if (makeamoved){


                
                socket.current?.send(JSON.stringify({ direction : "turn" , id: arrayposition, "event":"move",x:player.x,y:player.y}))
                makeamoved = false


             }
            
           }
    
           if (cursors.up.isDown  ){
            // let check = player.x > player1.x  ? player.x-player1.x : player1.x-player.x;
            // if (check<2){
            //      return
            // }
            player.setVelocityY(-160);
            socket.current?.send(JSON.stringify({ direction : "up" , id: arrayposition, "event":"move",x:player.x,y:player.y}))
            
           }

        //    this.physics.add.overlap(player, stars, collectStar,undefined, this);
        }

        return ()=> {

            phaseGameRead?.current?.destroy(true); // Destroy the Phaser game
            phaseGameRead.current = null;

        }
      
  },[socket.current]);





  function addPlayer( direction :string , movedplayer:number , id:number,x:number,y:number){
    // player = this.physics.add.sprite(x,y,'player');
        //  console.log(sceneref)s

        


        if (!players[id]){
            console.log("creating the player")
            // player1.body.setGravityY(player.body.gravity.y);
            player1 = sceneref.physics.add.sprite(x,y,"dude");
            const gravityY = player?.body?.gravity.y || 0;
            (player1.body as Phaser.Physics.Arcade.Body).setGravityY(gravityY);
            // if (player?.body?.gravity.y)
            //     (player1.body as Phaser.Physics.Arcade.Body).setGravityY(player?.body?.gravity.y)
            player1.setBounce(0.2)
            player1.setCollideWorldBounds(true); 
  
            sceneref.physics.add.collider(player1, platforms);
            sceneref.physics.add.collider(player1, player,()=>{

                player1.setVelocityX(0)
                player.setVelocityX(0)

                
                // player.setImmovable(true)
               


            });
            players[id] = {player:player1,x:x,y:y}
   
           
        }
        else{
             

            if (id==arrayposition){
   
            }
            else if (id == movedplayer  ){
                if (direction == "left")
                {
                    players[id].player.anims.play("left",true)

                }
                else if (direction == "right")
                {
                    players[id].player.anims.play("right",true)

                }
                else{
                    players[id].player.anims.play("turn",true)
                }

                players[id].player.setPosition(x,y)
                // players[id].player.setVelocityX(-160)
                
                players[id].x =x 
                players[id].y = y
                 
            }
            else{

                players[id].x =x 
                players[id].y = y 

            }
            // players[id].player.anims.play("turn",true)

           
         
        }
  }



  if (socket.current) {
    socket.current.onmessage = (msg: MessageEvent) => {
        // console.log("Message received:", msg.data);
        const data  = JSON.parse(msg.data)
         
        if (data.event == "call"){
            
            console.log("call received")
            calldata.current = data
            setReceiveCall(true) 
        }

        else if (data.event === 'accept') {
            console.log("call accepted")
            setAcceptdata(data)    
        }

       

        else{
            for (const keys in data.playerpostions){

                addPlayer(  data.direction , Number(data.id), Number(keys),data.playerpostions[keys].x,data.playerpostions[keys].y)
           }

        }
       

       
        
         
    };
}

  



  return (
    <>
    <div className='flex min-h-screen  justify-center items-center  '>
         {
            call   &&   <div className=' h-500 w-500 '> <VideoCall call={call} receive={receivecall} setReceive={setReceiveCall} ws={socket.current} calldata = {calldata.current}  id = {arrayposition} acceptdata = {acceptdata}   ></VideoCall>  </div>
         }
         {
            acceptcall && <div className=' h-500 w-500 '> <VideoCall call={call} receive={receivecall} setReceive={setReceiveCall} ws={socket.current} calldata = {calldata.current}  id = {arrayposition} acceptdata = {acceptdata}   ></VideoCall>  </div>
         }

         {
            receivecall &&  
              <div> 
                      <button onClick={()=>{
                        setAcceptCall(true)
                      }}  > recivecall </button>
                      <button onClick={()=>setReceiveCall(false)} > cutCall </button>
              </div>
      
         }

    <div  ref={gameContainerRef} style={{ width: window.innerWidth , height: window.innerHeight }} />

    </div>
    
    </>

  ) ;
};

export default PhaserGame;
