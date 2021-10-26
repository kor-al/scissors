//Source: Light types are from Three js Journey by Bruno Simon

uniform float uTime;

varying vec3 vColor;
// uniform sampler2D alphaMap;

void main()
{
    // // Disc
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5, strength);
    // strength = 1.0 - strength;

    // Diffuse point
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0;
    // strength = 1.0 - strength;

    //Light point
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0 + 3.0*cos(uTime));

      // Sample map with UV coordinates
    //float strength = texture2D(alphaMap, vec2(gl_PointCoord.x, 1. - gl_PointCoord.y)).r;

    // Final color
    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}