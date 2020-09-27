const config ={
      video:{ width: 640, height: 480, fps: 30}
    };

async function init_camera()
{
    const constraints ={
      audio: false,
      video:{
      width: config.video.width,
      height: config.video.height,
      facingMode: 'environment',
      frameRate: { max: config.video.fps }
      }
    };

    const video = document.getElementById("pose-video");
    video.width = config.video.width;
    video.height= config.video.height;

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
       video.srcObject = stream;
        //main();
    });
}

function init_canvas()
{
      const canvas =  document.getElementById("pose-canvas");
      canvas.width = config.video.width;
      canvas.height = config.video.height;
      console.log("Canvas initialized");
}


document.addEventListener('DOMContentLoaded',function(){
  init_canvas();
  init_camera();
});
