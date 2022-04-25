    
    
/*
This work was created by George Savva (Twitter @georgemsavva) and is released under a
Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) license.  https://creativecommons.org/licenses/by-sa/4.0/

This is a human-readable summary of (and not a substitute for) the license. Disclaimer.
You are free to:

Share — copy and redistribute the material in any medium or format
Adapt — remix, transform, and build upon the material
    for any purpose, even commercially.
This license is acceptable for Free Cultural Works.
The licensor cannot revoke these freedoms as long as you follow the license terms.

Under the following terms:
    Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
    ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.
    No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.
*/

function getColourMode(value){
  if (value<0.3) return "RGB" // High colour
  if (value<0.7) return "Subtle" // Low colour
  else return "Monochrome" // Monochrome  
}

function getCircleOnly(value){
  if (value<0.6) return("Full") 
  else return("Interior")   
}

function getBoundary(value){
  if (value<0.5) return("Circle"); // 0
  if (value<0.8) return("Square"); // 1
  else return("Diamond");  // 2
}

function getPower(value){
  return Math.ceil(value*5); 
}


window.$fxhashFeatures = {
  Color : getColourMode( fxrand() ),
  Shape : getCircleOnly( fxrand() ),
  Power : getPower( fxrand() ),
  Boundary : getBoundary( fxrand() )
}

var colorMode, circleOnly, boundaryMode;
switch(window.$fxhashFeatures.Color){
  case "RGB" :  colorMode=0;break;
  case "Subtle" :  colorMode=1;break;
  case "Monochrome" :  colorMode=2;break;
}
switch(window.$fxhashFeatures.Shape){
  case "Full" :  circleOnly=0;break;
  case "Interior" :  circleOnly=1;break;
}
switch(window.$fxhashFeatures.Boundary){
  case "Circle" :  boundaryMode=0;break;
  case "Square" :  boundaryMode=1;break;
  case "Diamond" : boundaryMode=2;break;

}


console.log(window.$fxhashFeatures.colorMode)
    const canvas = document.querySelector('#output')
    const gl = canvas.getContext('webgl')
 
    var minsize;
    function resize() {
      canvas.width = window.innerWidth 
      canvas.height = window.innerHeight 
      minsize = Math.min(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)
  
const vertexShaderSource = `
attribute vec2 aVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition.x/1.0,aVertexPosition.y/1.0, 0.0, 1.0);
}`

var fragmentShaderSource = `
#ifdef GL_ES
precision highp float;
#endif
       
uniform float uTime;
uniform vec2 uPosition;
uniform float dimx;
uniform float dimy;
uniform float f1;
uniform float f2;
uniform float f3;
uniform float f4;
uniform float a1;
uniform float a2;
uniform float a3;
uniform float a4;
uniform float hue1;
uniform float hue2;
uniform float speed1;
uniform float speed2;
uniform float speed3;
uniform float speed4;
uniform float power;
uniform int colorScheme;
uniform int boundaryMode;
uniform int colormode;
uniform int circleonly;

#define PI 3.14159

float radius=0.3;
vec3 vColor;
vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
	  return c.z * mix( vec3(1.0), rgb, c.y);
}
vec3 fCol(float x, float y){
  float r2=x*x+y*y;
  float r1=1.0*pow(abs(x),1.0)+pow(abs(y),1.0);
  if(boundaryMode==2) r2=r1/1.7;
  if(boundaryMode==1) r2=max(abs(x),abs(y))/1.5;
  float intensity = 
    min(3.0*(abs((radius-r2))),2.0)*(1.0/(1.0+r2))*
    abs(pow(abs(sin(3.0*r2-speed1*uTime/100.0)),10.0)*
      3.0*a1*
      sin(f1*x)*
      sin(f1*y)+     
    sin(y)*a2*
       sin(f2*x)*
       sin(f2*y) +  
    a3*sin(f4*x)*
       sin(f3*y)+
    a4*sin(f3*x+(step(0.0,x)-0.5)*speed3*uTime)*
       sin(f4*y-(step(0.0,y)-0.5)*speed4*uTime));
  intensity = abs(intensity);
  float v;
  if(circleonly==0) {
    v=pow(abs(sin(2.0*r2+(1.5-intensity)-uTime/1000.0)),clamp(power+r2*100.0,0.0,50.0));
    if(colormode<2 && power>5.0) v=clamp((v-r2/6.0)*1.5,0.0,1.0);
    }
  if(circleonly==1) {
    v=pow(abs(sin(2.0*r2+(1.0-intensity))),clamp(power+r2*100.0,0.0,20.0));
    v=v*(1.0-step(radius,r2))*clamp(50.0*(radius-r2),0.0,1.0);
    }
  float s=abs(mod(intensity+uTime/1000.0,1.0));
  if(colormode==0) s=clamp(speed2,.5,.9);
  if(colormode==2) s=0.0;
  if(colormode==1){
  vec3 vc1 = hsv2rgb(vec3(hue1,s,v));
  vec3 vc2 = hsv2rgb(vec3(hue2,s,v));
  vColor=mix(vc1,vc2,
    abs(mod(-1.0*uTime*0.001+r2*1.2+intensity*0.2,1.0)));
  }
  else{
  vColor=hsv2rgb(vec3(
      abs(mod(-1.0*uTime*0.001+r2*1.0+intensity*0.2,1.0)),
      0.7*step(0.5,s),
      v));
  if(mod(float(colorScheme),2.0)>0.5) vColor.x=min(vColor.z, vColor.y);
  if(mod(float(colorScheme),4.0)>1.0) vColor.y=min(vColor.z, vColor.x);
  //vColor.y=min(vColor.z,vColor.y/2.0);
  if(mod(float(colorScheme),8.0)>3.0) vColor.z=min(vColor.x, vColor.y);
  }
  vec3 bgcol=hsv2rgb(vec3(hue1,0.5,0.10));
  //vColor.z=0.9*vColor.z;
  return max(bgcol,vColor);
  }
  
void main(){
    radius = radius + float(circleonly)*0.1;
    float scale = 0.5;
    float x=(PI*scale*(gl_FragCoord.x - dimx/2.0)/dimy);
    float y=(PI*scale*(gl_FragCoord.y - dimy/2.0)/dimy);
    float pixwidth = 1.0*PI*scale*.5 / dimy;
    vec3 vColor1 = fCol(x,y);
    vec3 vColor2 = fCol(x,y+pixwidth);
    vec3 vColor3 = fCol(x+pixwidth,y);
    vec3 vColor4 = fCol(x+pixwidth,y+pixwidth);
    vec3 vColor5 = mix(vColor1,vColor2,0.5);
    vec3 vColor6 = mix(vColor3,vColor4,0.5);
    vec3 vColor7 = mix(vColor5,vColor6,0.5);
    gl_FragColor=vec4(vColor7,1.0);    
  }



`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const PI = 3.14159;
    const vertices = new Float32Array([
      -1,
      1,
      1,
      1,
      1,
      -1,
      -1,
      1,
      1,
      -1,
      -1,
      -1,
    ])
    
    const itemSize = 2
    const numItems = vertices.length / itemSize

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var coord = gl.getAttribLocation(program, "aVertexPosition");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aVertexPosition);

    var speed1, speed2,speed3, power,speed4,f1, f2,f3,f4,a1,a2,a3,a4,colorScheme,circleonly,hue1,hue2;
    do{ f1 =  Math.floor(fxrand()*10)+1;}while(f1<1);
    do{ f2 =  Math.floor(fxrand()*50)+1;}while(f2<1);
    do{ f3 =  Math.floor(fxrand()*20)+10;}while(f3<1);
    do{ f4 =  20+Math.floor(fxrand()*30)}while(f3==f4);
    a1 =  3+fxrand()*3
    a2 =  3+fxrand()*3
    a3 =  3+fxrand()*3
    a4 =  3+fxrand()*3
    hue1 = fxrand();
    hue2 = fxrand();
    speed1 =  .3+fxrand();
    speed2 =  .6*fxrand();
    do{speed3 =  .03*fxrand()-0.015;}while(Math.abs(speed3)<0.005);
    do{speed4 =  .03*fxrand()-0.015;}while(Math.abs(speed4)<0.005);
    var colorScheme = Math.floor(fxrand()*6)+1;
    const scale=2.0
      gl.uniform1f(gl.getUniformLocation(program, 'f1'), scale*f1)
      gl.uniform1f(gl.getUniformLocation(program, 'f2'), scale*f2)
      gl.uniform1f(gl.getUniformLocation(program, 'f3'), scale*f3)
      gl.uniform1f(gl.getUniformLocation(program, 'f4'), scale*f4)
      gl.uniform1f(gl.getUniformLocation(program, 'a1'), a1)
      gl.uniform1f(gl.getUniformLocation(program, 'a2'), a2)
      gl.uniform1f(gl.getUniformLocation(program, 'a3'), a3)
      gl.uniform1f(gl.getUniformLocation(program, 'a4'), a4)
      gl.uniform1f(gl.getUniformLocation(program, 'speed1'), speed1)
      gl.uniform1f(gl.getUniformLocation(program, 'speed2'), speed2)
      gl.uniform1f(gl.getUniformLocation(program, 'speed3'), speed4)
      gl.uniform1f(gl.getUniformLocation(program, 'speed4'), speed4)
      gl.uniform1f(gl.getUniformLocation(program, 'power'), window.$fxhashFeatures.Power)
      
      gl.uniform1f(gl.getUniformLocation(program, 'hue1'), hue1)
      gl.uniform1f(gl.getUniformLocation(program, 'hue2'), hue2)
      gl.uniform1i(gl.getUniformLocation(program, 'colorScheme'), colorScheme )
      gl.uniform1i(gl.getUniformLocation(program, 'circleonly'), circleOnly )
      gl.uniform1i(gl.getUniformLocation(program, 'colormode'), colorMode )
      gl.uniform1i(gl.getUniformLocation(program, 'boundaryMode'), boundaryMode )

    function render() {
    
      minsize = Math.min(canvas.width, canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.clearColor(.00,.00,.0, 0)

      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT)
          
      program.uTime = gl.getUniformLocation(program, 'uTime');
      gl.uniform1f(program.uTime, 0.1 * performance.now());

      gl.uniform1f(gl.getUniformLocation(program, 'dimx'), canvas.width)
      gl.uniform1f(gl.getUniformLocation(program, 'dimy'), canvas.height)
      
      gl.drawArrays(gl.TRIANGLES, 0, numItems);
      
      requestAnimationFrame(render)
    }
    resize()
    render()

    setTimeout(function(){
       // window.location.reload(1);
     }, 3000);