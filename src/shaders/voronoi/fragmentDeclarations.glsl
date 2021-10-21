// Author: @patriciogv
// Title: CellularNoise


uniform float uTime;
uniform float uScale;
uniform float uSpeed;
uniform float uRandomFactor;
uniform vec3 uColor1;
uniform vec3 uColor2;


varying vec2 vUv;

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}