//ufreq 50
//uappl 20
//float prevStrength = step(0.3, sin(cnoise((vUv-uOffset) * uFreq) * uAmplitude + uTime * uSpeed) );
float prevStrength = sin(cnoise((vUv-uOffset) * uFreq.x) * uAmplitude.x + uTime * uSpeed) ;
//float strength = step(0.9, sin(cnoise(vUv * uFreq) * uAmplitude + uTime * uSpeed) );
float strength = sin(cnoise(vUv * uFreq.y) * uAmplitude.y + uTime * uSpeed);
// Final color
// vec3 uvColor = vec3(1.0);;//vec3(vUv, 1.0);
vec3 mixedColor = mix(uBackgroundColor, uColor1, strength); 
mixedColor = mix(mixedColor, uColor2, prevStrength); 
//mixedColor = mix(mixedColor, vec3(0.33), prevStrength2)

vec4 diffuseColor = vec4(mixedColor, 1.0);
//diffuseColor = vec4(mix(vec3(0.0), vec3(1.1), strength) , 1.0);