import React, { useEffect, useRef } from "react"

interface callData {
  event : string,
  sdp : RTCSessionDescriptionInit,
  candidate : RTCIceCandidate
}


interface Props{
  id : number,
   call : boolean,
   receive : boolean,
   setReceive : React.Dispatch<boolean>,
   ws : WebSocket | null,
   calldata : callData | null
   acceptdata : callData | null
}

const mediaDevicesonstraint = {
  video : true , 
  audio : true
 }

 const configuration = {
  'iceServers' : [
  { urls: 'stun:stun1.l.google.com:19302' }, 
  { urls: 'stun:stun2.l.google.com:19302' }
]
 }
 let sent  =false

 const peerConnection = new RTCPeerConnection(configuration)


export function VideoCall(
  {id,
    call,
    receive,
    setReceive,
    ws,
    calldata,
    acceptdata
  }: Props
) {


       const caller = useRef<HTMLVideoElement | null>(null)
       const receiver = useRef < HTMLVideoElement | null>(null)
       const sdp = useRef<RTCSessionDescriptionInit | null> (null)
       const candidate = useRef<RTCIceCandidate | null>(null)

       
      
         if (!ws) return <h1>unable to make a call</h1>

             id = id==0 ? 1 : 0;

             console.log("other user id is ",id)


           
            peerConnection.onicecandidate = (event)=>{
            if (event.candidate)
               candidate.current = event.candidate
               const method =   call ?  "call" : "accept";
               if (!sent)
               {
                ws?.send(JSON.stringify({event:method, sdp: sdp.current , candidate: candidate.current , id :id }))
                console.log("data is sent to the server")
                sent = true
               }
            }

            peerConnection.ontrack = (event) => {
              if (receiver.current)
                 receiver.current.srcObject = event.streams[0];
      };
      

     




      
     function makeCall(){
        navigator.mediaDevices.getUserMedia(mediaDevicesonstraint)
          .then( async (stream: MediaStream)=>{
            if (caller.current){
                caller.current.srcObject = stream;
            }
            stream.getTracks().forEach((track)=>peerConnection.addTrack(track,stream))
             sdp.current = await peerConnection.createOffer()
             await peerConnection.setLocalDescription(sdp.current)
          
          })
          .catch((err)=>{
            console.log("error occured in the file")
          })
      }

      function answerCall(){
        console.log("answeing a call")
        navigator.mediaDevices.getUserMedia(mediaDevicesonstraint)
          .then(async (stream: MediaStream)=>{
            if (caller.current){
                caller.current.srcObject = stream;
                stream.getTracks().forEach((track)=>peerConnection.addTrack(track,stream))
                const answer = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)
                sdp.current = answer
            }
          })
          .catch((err)=>{
            console.log("error occured in the file")
          })
      }

      if (acceptdata){
        console.log("accept data is ",acceptdata)
        peerConnection.setRemoteDescription(new RTCSessionDescription(acceptdata.sdp))
        peerConnection.addIceCandidate( new RTCIceCandidate(acceptdata.candidate))
      }

    
        

       
      


       

      if (call) makeCall()
      else if (receive) {
        if (calldata) {
          console.log(calldata)
          peerConnection.setRemoteDescription(new RTCSessionDescription(calldata.sdp))
          // peerConnection.a(new RTCIceCandidate(calldata.candidate))
          answerCall()
        
        }
       else  return <h1>unable to acceptcall</h1>

      }


      
    return <>
        <div className="caller ">
            <video autoPlay muted id="callervideo" ref={caller}  > </video>
         </div>

          <div className="receiver"> 
          <video autoPlay muted id="callervideo" ref={receiver}  > </video>
          </div>
    </>

}