uniform float uTime;
uniform int uOctaves;
uniform vec3 uColor1a;
uniform vec3 uColor1b;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uScale;
uniform vec2 uSpeed;
uniform vec2 uRotation;
uniform vec3 uDegreeWeights;


varying vec2 vUv;

//Based on the shaders from the Book of shaders
//https://thebookofshaders.com/13/

float fbm (in vec2 st) {
    float value = 0.0;
    float amplitude = 2.;//0.5;
    float frequency = 1.;
    vec2 shift = vec2(10.0);

    for (int i = 0; i < uOctaves; i++) {
        value += amplitude * cnoise((shift + st) * frequency);
        amplitude *= .5;
        frequency *= 2.0;
    }
    return value;
}