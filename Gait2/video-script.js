//Global Variables
const canvas =  document.getElementById("pose-canvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("pose-video");

var dflag=false, kflag=false, strideflag=false, rsflag=false, lsflag=false;
var lr_step_threshold=0, initial_height_px=0, height_cm=156;
var  n1=0, n2=0, start_point=0,cnfThreshold=0.10;
var pose;

const config ={
    video:{ width: 480, height: 640, fps: 30}
};

async function initializeParameters(button)
{
    // Initializing parameters like height, start point, lr_step_threshold

    let eyeL = pose.pose.leftEye
    let eyeR = pose.pose.rightEye
    let ankleL = pose.pose.leftAnkle
    let ankleR = pose.pose.rightAnkle
    let kneeR = pose.pose.rightKnee
    let count =0;
    let timeFrame = 1000
    let start = new Date().getTime();
    let end = start;
    
    while(end - start < timeFrame)
    {
        if(eyeL.confidence >= cnfThreshold && eyeR.confidence >= cnfThreshold && ankleL.confidence >= cnfThreshold && ankleR.confidence>=cnfThreshold)
        {
            start_point = start_point+ (ankleL.y +ankleR.y)/2
            lr_step_threshold = lr_step_threshold + distance(0, ankleL.y, 0, ankleR.y)
            initial_height_px = initial_height_px+ (distance(0, eyeL.y, 0, ankleL.y) + distance(0, eyeR.y, 0, ankleR.y))/2;
            count = count +1;
            button.innerHTML = "Initializing ...."
        }

        end = new Date().getTime();
    }


    height_cm = document.getElementById("height").value;
    initial_height_px  = (initial_height_px / count).toFixed(2);
    start_point = (start_point / count).toFixed(2)
    lr_step_threshold = ((lr_step_threshold/count) * (height_cm/initial_height_px)).toFixed(2);

    button.innerHTML = "Done"
}

function toggleDistance(button)
{
    // To Toggle distance button between detect and pause

    if (dflag)
    {
        dflag = false;
        button.innerHTML= "Start"; 
    } 
    else 
    {
        dflag = true;
        timer()
        button.innerHTML= "Stop";
        
    }
}

function timer()
{
    // Timer Function, Starts when distance button is in detect mode
    // Gets cleared when distance button is in pause mode

    let sec=0,min=0;

    var time = setInterval(function(){
    	
        if (!dflag) {
            clearInterval(time);
        }
        
    	document.getElementById('time').innerHTML=min+":"+sec;
        sec++;

        if(sec == 60)
        {
            sec=0;
            min++;
        }
        
    }, 1000);
}

function toggleKnee(button)
{
    // To toggle knee button between Detect and pause

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
    // To toggle stride length button between Detect and pause
    // Activates only when both right and left step length is in detect mode

    if (strideflag) 
    {
        strideflag = false;
        button.innerHTML= "Detect"; 
    } 
    else {

        if(!rsflag){
            document.getElementById("stride").innerHTML= "Activate Right Step Length"
        }
        else if(!lsflag){
            document.getElementById("stride").innerHTML = "Activate Left Step Length"
        }
        else{
            strideflag = true;
            button.innerHTML= "Pause";
        }   
    }
}

function toggleRightStep(button)
{
    // To toggle right step length button between Detect and pause

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
    // To toggle left step length button between detect and pause

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

function distance(x1,y1,x2,y2)
{
    // calculate eucliedean distance between point(x1,y1) and (x2,y2)

    let a = x2-x1;
    let b = y2-y1;
    let result = Math.sqrt( a*a + b*b);

    return result;
}

function drawPoint(x, y, radius, color)
{
    // draw a solid circle of specified radius and color at point(x,y)

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(x1,y1,x2,y2,color)
{
    // draw a line from point(x1,y1) to point(x2,y2)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function modelReady()
{
    // callback function, gets called when posenet model has loaded successfully
    
    console.log('Model Ready')
    video.play();
    draw();
}

function gotPoses(poses)
{
    // callback function, gets called posenet detects poses

    //console.log(poses)
    if(poses.length > 0)
    {
        pose = poses[0]
    }
}


async function main()
{
    // Main function
    // Initialize required variables, load model, etc.

    const initializeBttn = document.getElementById("bttn3");
    const strideBttn = document.getElementById("bttn4");
    const rightStepBttn = document.getElementById("bttn5");
    const leftStepBttn = document.getElementById("bttn6");
    const kneeBttn = document.getElementById("bttn7")
    const distanceBttn = document.getElementById("bttn8");

    initializeBttn.onclick = function(){
        initializeParameters(initializeBttn)
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

    distanceBttn.onclick = function(){
        toggleDistance(distanceBttn)
    }

    const options = {
        architecture: 'MobileNetV1',
        scoreThreshold: 0.6,
        nmsRadius: 20,
        detectionType: 'multiple',
        maxPoseDetections: 2,
        flipHorizontal: false,
        multiplier: 0.50,
        outputStride: 16,    
    }
    
    video.src = "videos/video3.mp4";
    //video.playbackRate = 0.1;                // video File
    //video.src ="http://192.168.43.82:4747/"       //  IP web cam

    video.width = config.video.width;
    video.height= config.video.height;

    canvas.width = config.video.width;
    canvas.height = config.video.height;
    console.log("Canvas initialized");

    const poseNet = ml5.poseNet(video,options, modelReady);
    poseNet.on('pose',gotPoses);
}


function calculateAngle(x1,y1,x2,y2,x3,y3)
{
    // calculate angle between the lines
    // considering a line of slope 0 at point (x2,y2)
     
    let m1 = (y2-y1)/(x2-x1)    
    let m2 = 0
    let m3 = (y3-y2)/(x3-x2)    

    let a1 = Math.abs((m2-m1)/(1+ m1*m2))
    let a2 = Math.abs((m3-m2)/(1+ m3*m2))

    let angle_rad1 = Math.atan(a1)
    let angle_rad2 = Math.atan(a2)
        
    let angle1 = angle_rad1 *(180.0 / Math.PI)
    let angle2 = angle_rad2 *(180.0 / Math.PI)
    
    let angle = (angle1+ angle2).toFixed(2)

    return angle
}

function draw()
{
    // draw image frame,skeleton points
    // calculate right & left step length,stride length, joint angles and display it

    if (video.paused || video.ended) {
        return;
    }
    ctx.drawImage(video,0, 0, video.width, video.height)
    if(pose)
    {
        for(var i=0;i< pose.pose.keypoints.length;i++)
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
        let hipR = pose.pose.rightHip
        let hipL = pose.pose.leftHip

        //drawPoint(kneeR.x,kneeR.y,3,'yellow')

        let current_height_px = ( (distance(0, eyeL.y, 0, ankleL.y) + distance(0, eyeR.y, 0, ankleR.y))/2 ).toFixed(2);
        let px2cm_factor= (height_cm/current_height_px).toFixed(2);
        
        //Right Knee Angle 
        document.getElementById("rk-angle").innerHTML = calculateAngle(hipR.x, hipR.y, kneeR.x, kneeR.y, ankleR.x, ankleR.y)

        //Left Knee Angle 
        document.getElementById("lk-angle").innerHTML = calculateAngle(hipL.x, hipL.y, kneeL.x, kneeL.y, ankleL.x, ankleL.y)

        // Hip Angle
        let mid_x = (hipR.x + hipL.x)/2;
        let mid_y = (hipR.y + hipL.y)/2;
        document.getElementById("hip-angle").innerHTML = (180-calculateAngle(kneeR.x, kneeR.y,mid_x, mid_y, kneeL.x, kneeL.y)).toFixed(2)
        

        if(dflag)
        {
            let end_point = (ankleL.y+ankleR.y)/2
            let d = Math.abs(start_point - end_point)
            d = (height_cm/initial_height_px) * (d)
            document.getElementById("distance").innerHTML = d.toFixed(2)
        }

        if(kflag == true)
        {
            let d = distance(kneeL.x, kneeL.y, kneeR.x, kneeR.y)
            d = px2cm_factor * (d)
            document.getElementById("knee-d").innerHTML= d.toFixed(2);
        }

        if(rsflag == true)
        {
            let d = ankleR.y - ankleL.y
            d = px2cm_factor * (d)

            if (d <= lr_step_threshold)
            {
                document.getElementById("rs-d").innerHTML = 0;
            }
            else
            {
                document.getElementById("rs-d").innerHTML = (d-lr_step_threshold).toFixed(2);
                n1=d;
            } 
        }

        if(lsflag == true)
        {
            let d = ankleL.y - ankleR.y
            d = px2cm_factor * (d)

            if (d <= lr_step_threshold)
            {
                document.getElementById("ls-d").innerHTML = 0;
            }
            else
            {
                document.getElementById("ls-d").innerHTML = (d- lr_step_threshold).toFixed(2);
                n2=d;
            } 
        }

        if(strideflag == true)
        {
            if( n1 > 0 && n2 > 0 )
                document.getElementById("stride").innerHTML = (n1+n2).toFixed(2)
            else
                document.getElementById("stride").innerHTML = "Unable to detect feet";
        }

    }
    
    requestAnimationFrame(draw);
    //setTimeout(draw, 1000 / 30);
}


document.addEventListener("DOMContentLoaded",function(){
    main();
});
