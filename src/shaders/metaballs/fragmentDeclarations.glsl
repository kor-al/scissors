//Based on Metaballs shader by @patriciogv - 2015
// From the Book of Shaders

uniform float uTime;
uniform float uScale;
uniform float uSpeed;
uniform float uTintSpeed;
uniform vec3 uColorInvertion1;
uniform vec3 uColorInvertion2;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uTintColorFrom;
uniform vec3 uTintColorTo;
uniform vec2 uStepThreshold;

varying vec2 vUv;

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}