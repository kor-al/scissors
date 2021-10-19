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

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

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


void main()
{

    vec2 st = vUv * uScale;

    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.1 * uTime * uSpeed.x);
    q.y = fbm( st + 0.1 * uTime * uSpeed.x);

    vec2 r = vec2(0.);
    r.x = fbm( st + uRotation.x * q + uTime * uSpeed.y);
    r.y = fbm( st + uRotation.y * q + uTime * uSpeed.y);

    float f = fbm(r + st);

    color = mix(uColor1a, //vec3(0.9,0.0,0.0),
                uColor1b, //vec3(0.5,0.0,0.9),
                clamp(f,0.0,1.0));

    color = mix(color,
                uColor2,//vec3(0,0,0.9),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                uColor3,//vec3(0,0.7,0.3),
                clamp(length(r),0.0,1.0));

    gl_FragColor = vec4((uDegreeWeights.x*f*f + uDegreeWeights.y*f*f+ uDegreeWeights.z*f)*color,1.);

}