
const canvas =  document.getElementById("pose-canvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("pose-video");
let hflag =false, kflag=false, strideflag=false, rsflag=false, lsflag=false;
let pose;
var d1=0,d2=0;

const config ={
    video:{ width: 640, height: 480, fps: 30}
};


function toggleHeight(button)
{
    if (hflag) 
    {
        hflag = false;
        button.innerHTML= "Detect"; 
    } 
    else 
    {
        hflag = true;
        button.innerHTML= "Pause";
    }
}

function toggleKnee(button)
{
    if (kflag) 
    {
        kflag = false;
        button.innerHTML= "Detect"; 
    } 
    else 
    {
        kflag = true;
        button.innerHTML= "Pause";
    }
}

function toggleStrideLength(button)
{
    if (strideflag) 
    {
        strideflag = false;
        button.innerHTML= "Detect"; 
    } 
    else 
    {
        strideflag = true;
        button.innerHTML= "Pause";
    }
}

function toggleRightStep(button)
{
    if (rsflag) 
    {
        rsflag = false;
        button.innerHTML= "Detect"; 
    } 
    else 
    {
        rsflag = true;
        button.innerHTML= "Pause";
    }
}

function toggleLeftStep(button)
{
    if (lsflag) 
    {
        lsflag = false;
        button.innerHTML= "Detect"; 
    } 
    else 
    {
        lsflag = true;
        button.innerHTML= "Pause";
    }
}

function modelReady()
{
    console.log('Model Ready')
}

function distance(x1,y1,x2,y2)
{
    let a = x2-x1;
    let b = y2-y1;
    let result = Math.sqrt( a*a + b*b);

    return result;
}

function drawPoint(x, y, radius, color)
{
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(x1,y1,x2,y2,color)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function gotPoses(poses)
{
    //console.log(poses)
    if(poses.length > 0)
    {
        pose = poses[0]
    }
}

function draw()
{
    if (video.paused || video.ended) {
        return;
    }
    ctx.drawImage(video,0, 0, video.width, video.height)
    if(pose)
    {
        for(i=0;i< pose.pose.keypoints.length;i++)
        {
            let x = pose.pose.keypoints[i].position.x;
            let y = pose.pose.keypoints[i].position.y
            drawPoint(x,y,3,'red')
        } 

        let skeleton = pose.skeleton

        for(i=0;i<skeleton.length;i++)
        {
            let partA = skeleton[i][0];
            let partB = skeleton[i][1];
                
            drawLine(partA.position.x, partA.position.y, partB.position.x, partB.position.y,'red')
        }

        let eyeL = pose.pose.leftEye
        let eyeR = pose.pose.rightEye
        let ankleL = pose.pose.leftAnkle
        let ankleR = pose.pose.rightAnkle
        let kneeL = pose.pose.leftKnee
        let kneeR = pose.pose.rightKnee

        if (hflag == true)
        {
            var d = distance(eyeL.x, eyeL.y, ankleL.x, ankleL.y)
            document.getElementById("height").innerHTML= d.toFixed(2);
        }

        if(kflag == true)
        {
            var d = distance(kneeL.x, kneeL.y, kneeR.x, kneeR.y)
            document.getElementById("knee-d").innerHTML= d.toFixed(2);
        }

        if(rsflag == true)
        {
            var d = distance(ankleL.x, ankleL.y, ankleR.x, ankleR.y)
            document.getElementById("rs-d").innerHTML = d.toFixed(2);
            d1=d;
        }

        if(lsflag == true)
        {
            var d = distance(ankleL.x, ankleL.y, ankleR.x, ankleR.y)
            document.getElementById("ls-d").innerHTML = d.toFixed(2)
            d2=d;
        }

        if(strideflag == true)
        {
            if( (d1+d2) >0 )
                document.getElementById("stride").innerHTML = (d1+d2).toFixed(2)
            else
                document.getElementById("stride").innerHTML = "Unable to detect feet";

        }
    }
    
    requestAnimationFrame(draw);
    //setTimeout(draw, 1000 / 30);
}


async function main()
{
    const startBttn = document.getElementById("start");
    const stopBttn = document.getElementById("stop");
    const heightBttn = document.getElementById("bttn1");
    const strideBttn = document.getElementById("bttn2");
    const rightStepBttn = document.getElementById("bttn3");
    const leftStepBttn = document.getElementById("bttn4");
    const kneeBttn = document.getElementById("bttn5")

    heightBttn.onclick = function(){
        toggleHeight(heightBttn)
    }

    strideBttn.onclick = function(){
        toggleStrideLength(strideBttn)
    }

    rightStepBttn.onclick = function(){
        toggleRightStep(rightStepBttn)
    }

    leftStepBttn.onclick = function(){
        toggleLeftStep(leftStepBttn)
    }

    kneeBttn.onclick = function(){
        toggleKnee(kneeBttn)
    }

    const options = {
        imageScaleFactor: 0.3,
        outputStride: 16,
        flipHorizontal: false,
        minConfidence: 0.5,
        maxPoseDetections: 5,
        scoreThreshold: 0.5,
        nmsRadius: 20,
        detectionType: 'multiple',
        multiplier: 0.75,
    }

    const poseNet = ml5.poseNet(video,options, modelReady);
    poseNet.on('pose',gotPoses);

    startBttn.onclick = function(){
        console.log("loadeddata");
        video.play();
        //setTimeout(videoLoop, 1000 / 30);
        draw()
    }

    stopBttn.onclick = function(){
        video.pause()
    }

}

async function init_camera_canvas()
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
    
    video.width = config.video.width;
    video.height= config.video.height;

    canvas.width = config.video.width;
    canvas.height = config.video.height;
    console.log("Canvas initialized");

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream;
        main();
    });
}

document.addEventListener('DOMContentLoaded',function(){
    init_camera_canvas();
});